import { Request, Response } from 'express';
import { processResume } from '../services/resumeProcessingService';
import { db } from '../config/firebase.config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeStructuredResume } from '../services/ai/resumeAnalysisService';

export const processResumeHandler = async (req: Request, res: Response) => {
  const { resumeId, fileUrl } = req.body;

  if (!resumeId || !fileUrl) {
    return res.status(400).json({ 
      success: false, 
      code: 'BAD_REQUEST', 
      message: 'resumeId and fileUrl are required', 
      retryable: false 
    });
  }

  try {
    const result = await processResume(resumeId, fileUrl);
    
    if (!result.aiSuccess) {
      // Resume parsed successfully but AI failed
      return res.status(200).json({ 
        success: true, 
        aiSuccess: false,
        message: 'Resume parsed successfully, but AI analysis is temporarily unavailable.',
        aiError: result.aiError
      });
    }

    res.status(200).json({ success: true, aiSuccess: true, message: 'Resume processed successfully' });
  } catch (error: any) {
    console.error('Error in processResumeHandler:', error);
    // Error is already structured by processResume
    const structuredError = {
      success: false,
      code: error.code || 'INTERNAL_SERVER_ERROR',
      phase: error.phase || 'PROCESSING',
      message: error.message || 'Failed to process resume',
      retryable: error.retryable || false
    };
    res.status(500).json(structuredError);
  }
};

export const reanalyzeResumeHandler = async (req: Request, res: Response) => {
  const { id: resumeId } = req.params;

  if (!resumeId) {
    return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'resumeId is required' });
  }

  try {
    const resumeRef = doc(db, 'resumes', resumeId as string);
    const resumeSnap = await getDoc(resumeRef);

    if (!resumeSnap.exists()) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Resume not found' });
    }

    const data = resumeSnap.data();
    if (!data.analysis?.structuredResume) {
      return res.status(400).json({ success: false, code: 'INVALID_STATE', message: 'Resume has not been successfully structured yet.' });
    }

    await updateDoc(resumeRef, {
      'status.state': 'AI_ANALYZING'
    });

    const analyzeStart = performance.now();
    const aiAnalysis = await analyzeStructuredResume(data.analysis.structuredResume);
    const analyzeMs = Math.round(performance.now() - analyzeStart);

    await updateDoc(resumeRef, {
      'analysis.aiAnalysis': aiAnalysis,
      'analysis.processingMetrics.analyzeMs': analyzeMs,
      'status.state': 'AI_COMPLETED',
      'status.lastAnalysisAt': serverTimestamp()
    });

    res.status(200).json({ success: true, message: 'AI Analysis completed successfully.' });
  } catch (error: any) {
    console.error('Error in reanalyzeResumeHandler:', error);
    const errorCode = error.code || 'AI_ANALYSIS_ERROR';
    
    try {
      const resumeRef = doc(db, 'resumes', resumeId as string);
      await updateDoc(resumeRef, {
        'status.state': 'AI_ANALYSIS_FAILED',
        'status.lastAnalysisAt': serverTimestamp(),
        'status.error': {
          phase: 'ANALYZING',
          code: errorCode,
          message: error.message || 'Failed to generate AI analysis.',
          timestamp: serverTimestamp()
        }
      });
    } catch (updateErr) {
      console.error('Failed to update status on reanalyze failure:', updateErr);
    }

    res.status(500).json({
      success: false,
      code: errorCode,
      phase: 'ANALYZING',
      message: error.message || 'Failed to reanalyze resume.',
      retryable: error.retryable !== false
    });
  }
};
