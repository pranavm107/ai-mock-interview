import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { downloadResume } from '../utils/downloadResume';
import { parsePdf } from './pdfParserService';
import { normalizeResumeText } from './resumeNormalizerService';
import crypto from 'crypto';

export const processResume = async (resumeId: string, fileUrl: string): Promise<void> => {
  const resumeRef = doc(db, 'resumes', resumeId);
  const startTime = performance.now();
  let currentPhase = 'PROCESSING';

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
    const normalizeStart = performance.now();
    const { normalizedText, normalizationStats, entities, sections, language, structuredResume } = normalizeResumeText(parsedText);
    const normalizeMs = Math.round(performance.now() - normalizeStart);
    
    // We can consider the structure time as part of normalizeMs, or just log it all here.
    const totalMs = Math.round(performance.now() - startTime);

    // 7. Update Firestore to STRUCTURED
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
        normalizeMs,
        structureMs: 0, // bundled in normalizeMs for now
        totalMs
      },
      'status.state': 'STRUCTURED'
    });

  } catch (error: any) {
    console.error(`Failed to process resume ${resumeId} at phase ${currentPhase}:`, error);
    // 8. Update to FAILED on error with detailed object
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
    throw error;
  }
};
