import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { downloadResume } from '../utils/downloadResume';
import { parsePdf } from './pdfParserService';
import { normalizeResumeText } from './resumeNormalizerService';
import crypto from 'crypto';

export interface ProcessResumeResult {
  success: boolean;
  aiSuccess: boolean;
  aiError?: any;
}

export const processResume = async (resumeId: string, fileUrl: string): Promise<ProcessResumeResult> => {
  const resumeRef = doc(db, 'resumes', resumeId);
  const startTime = performance.now();
  let currentPhase = 'PROCESSING';
  let aiSuccess = true;
  let aiErrorObj = null;

  try {
    // 1. Update status to PROCESSING
    await updateDoc(resumeRef, {
      'status.state': 'PROCESSING',
      'status.processingStartedAt': serverTimestamp()
    });

    // 2. Download PDF
    const downloadStart = performance.now();
    const pdfBuffer = await downloadResume(fileUrl);
    const downloadMs = Math.round(performance.now() - downloadStart);

    // 3. Extract text
    currentPhase = 'PARSING';
    const parseStart = performance.now();
    const parsedText = await parsePdf(pdfBuffer);
    const parseMs = Math.round(performance.now() - parseStart);

    if (!parsedText || parsedText.trim().length === 0) {
      throw new Error("Extracted text is empty or PDF could not be parsed.");
    }

    const textHash = crypto.createHash('sha256').update(parsedText).digest('hex');

    // 4. Update Firestore to PARSED
    await updateDoc(resumeRef, {
      'metadata.hash': textHash,
      'analysis.parsedText': parsedText,
      'status.state': 'PARSED',
      'status.processedAt': serverTimestamp()
    });

    // 5. Update state to NORMALIZING
    currentPhase = 'NORMALIZING';
    await updateDoc(resumeRef, {
      'status.state': 'NORMALIZING'
    });

    // 6. Run normalization
    // 6. Run normalization & structuring
    const { normalizedText, normalizationStats, entities, sections, language, structuredResume, timings } = normalizeResumeText(parsedText);
    
    // 7. Validate Data Quality
    const startValidation = performance.now();
    const { validateStructuredResume } = require('./structuredResumeValidator');
    validateStructuredResume(structuredResume);
    const validationMs = Math.round(performance.now() - startValidation);

    const totalMs = Math.round(performance.now() - startTime);

    // 8. Update Firestore to STRUCTURED
    currentPhase = 'STRUCTURING';
    await updateDoc(resumeRef, {
      'analysis.normalizedText': normalizedText,
      'analysis.sections': sections,
      'analysis.entities': entities,
      'analysis.language': language,
      'analysis.structuredResume': structuredResume,
      'analysis.normalizationStats': normalizationStats,
      'analysis.processingMetrics': {
        downloadMs,
        parseMs,
        normalizeMs: Math.round(timings.normalizeMs),
        entityExtractionMs: Math.round(timings.entityExtractionMs),
        sectionDetectionMs: Math.round(timings.sectionDetectionMs),
        structureMs: Math.round(timings.structureMs),
        validationMs,
        totalMs
      },
      'status.state': 'STRUCTURED'
    });

    // 8. Run AI Analysis
    currentPhase = 'ANALYZING';
    await updateDoc(resumeRef, {
      'status.state': 'AI_ANALYZING'
    });

    const analyzeStart = performance.now();
    
    try {
      let aiAnalysis;
      
      // Check cache
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const resumesCol = collection(db, 'resumes');
      const q = query(resumesCol, where('metadata.hash', '==', textHash), where('status.state', '==', 'AI_COMPLETED'));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty && querySnapshot.docs[0].data().analysis?.aiAnalysis) {
        console.log(`[AI Cache Hit] Reusing AI analysis for hash ${textHash}`);
        aiAnalysis = querySnapshot.docs[0].data().analysis.aiAnalysis;
      } else {
        console.log(`[AI Cache Miss] Calling Gemini for hash ${textHash}`);
        const { analyzeStructuredResume } = require('./ai/resumeAnalysisService');
        aiAnalysis = await analyzeStructuredResume(structuredResume);
      }
      
      const analyzeMs = Math.round(performance.now() - analyzeStart);
      const finalTotalMs = Math.round(performance.now() - startTime);

      // 9. Update Firestore to AI_COMPLETED
      console.log(`[AI Analysis Completed] Successfully analyzed resume ${resumeId}`);
      await updateDoc(resumeRef, {
        'analysis.aiAnalysis': aiAnalysis,
        'analysis.processingMetrics.analyzeMs': analyzeMs,
        'analysis.processingMetrics.totalMs': finalTotalMs,
        'status.state': 'AI_COMPLETED',
        'status.lastAnalysisAt': serverTimestamp()
      });
    } catch (aiError: any) {
      console.error(`[Gemini Request Failed] Failed to analyze resume ${resumeId}:`, aiError.message);
      
      // Extract specific AI error code if available, otherwise generic
      const errorCode = aiError.code || 'AI_ANALYSIS_ERROR';
      aiSuccess = false;
      aiErrorObj = {
        code: errorCode,
        message: aiError.message || 'Failed to generate AI analysis.',
        retryable: aiError.retryable !== false
      };
      
      await updateDoc(resumeRef, {
        'status.state': 'AI_ANALYSIS_FAILED',
        'status.lastAnalysisAt': serverTimestamp(),
        'status.error': {
          phase: 'ANALYZING',
          code: errorCode,
          message: aiError.message || 'Failed to generate AI analysis.',
          timestamp: serverTimestamp()
        }
      });
      // Do NOT throw error; the deterministic resume processing was successful.
    }

    return { success: true, aiSuccess, aiError: aiErrorObj };

  } catch (error: any) {
    console.error(`Failed to process resume ${resumeId} at phase ${currentPhase}:`, error);
    // 10. Update to FAILED on unrecoverable deterministic error
    try {
      await updateDoc(resumeRef, {
        'status.state': 'FAILED',
        'status.processedAt': serverTimestamp(),
        'status.error': {
          phase: currentPhase,
          message: error.message || 'Unknown error occurred',
          timestamp: serverTimestamp()
        }
      });
    } catch (updateErr) {
      console.error(`Failed to update status to FAILED for resume ${resumeId}:`, updateErr);
    }
    
    // Create structured error
    throw {
      success: false,
      code: error.code || 'DETERMINISTIC_PROCESSING_ERROR',
      phase: currentPhase,
      message: error.message || 'Failed to parse resume.',
      retryable: false
    };
  }
};
