import { Request, Response } from 'express';
import { VoiceSessionService } from '../services/voice/voiceSessionService';
import { VoiceSessionStatus } from '../types/voice';
import { voiceConfig } from '../config/voiceConfig';

// In a real app, you might manage these in a Map or DB
const activeVoiceSessions = new Map<string, VoiceSessionService>();

export const startVoiceSession = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    
    if (activeVoiceSessions.has(sessionId)) {
      return res.status(400).json({ error: 'Voice session already active' });
    }

    const voiceSessionService = new VoiceSessionService(sessionId);
    
    activeVoiceSessions.set(sessionId, voiceSessionService);

    await voiceSessionService.startSession();

    console.log(`Voice session started for ${sessionId}`);
    console.log('Deepgram model:', voiceConfig.deepgram.model);
    console.log('Deepgram language:', voiceConfig.deepgram.language);
    
    try {
      const dgPkg = require('@deepgram/sdk/package.json');
      console.log('Deepgram SDK version:', dgPkg.version);
    } catch (e) {
      console.log('Deepgram SDK version: unknown');
    }

    res.json({ success: true, session: voiceSessionService.getSession() });
  } catch (error) {
    console.error('Error starting voice session:', error);
    res.status(500).json({ error: 'Failed to start voice session' });
  }
};

export const stopVoiceSession = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const voiceSessionService = activeVoiceSessions.get(sessionId);
    
    if (!voiceSessionService) {
      // It's already stopped or was never started, return success
      return res.json({ success: true, message: 'Voice session was not active' });
    }

    voiceSessionService.stopSession();
    activeVoiceSessions.delete(sessionId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error stopping voice session:', error);
    res.status(500).json({ error: 'Failed to stop voice session' });
  }
};

export const getVoiceSessionStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const voiceSessionService = activeVoiceSessions.get(sessionId);
    
    if (!voiceSessionService) {
      return res.json({ status: 'NOT_FOUND' });
    }

    res.json({ session: voiceSessionService.getSession() });
  } catch (error) {
    console.error('Error getting voice session status:', error);
    res.status(500).json({ error: 'Failed to get voice session status' });
  }
};

export const replayQuestion = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { text } = req.body;

    const voiceSessionService = activeVoiceSessions.get(sessionId);
    if (!voiceSessionService) {
      return res.status(404).json({ error: 'Voice session not found' });
    }

    // Convert text to speech
    const audioBuffer = await voiceSessionService.speak(text);
    
    if (audioBuffer) {
      // Send audio directly as response for playback, or just send a success 
      // and use websocket to transmit. 
      // Here we send back base64 for simplicity
      res.json({ success: true, audio: audioBuffer.toString('base64') });
    } else {
      res.status(500).json({ error: 'Failed to generate audio' });
    }

  } catch (error) {
    console.error('Error replaying question:', error);
    res.status(500).json({ error: 'Failed to replay question' });
  }
};
export const startAnswer = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const voiceSessionService = activeVoiceSessions.get(sessionId);
    if (!voiceSessionService) return res.status(404).json({ error: 'Voice session not found' });
    
    // Starting an answer shouldn't clear transcript unless specifically requested,
    // but in this flow, start answer transitions the state.
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start answer' });
  }
};

export const finishAnswer = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const voiceSessionService = activeVoiceSessions.get(sessionId);
    if (!voiceSessionService) return res.status(404).json({ error: 'Voice session not found' });
    
    // Mark as submitting
    res.json({ success: true, transcript: voiceSessionService.getCurrentTranscript() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to finish answer' });
  }
};

export const restartAnswer = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const voiceSessionService = activeVoiceSessions.get(sessionId);
    if (!voiceSessionService) return res.status(404).json({ error: 'Voice session not found' });
    
    // Clear transcript
    voiceSessionService.clearTranscript();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restart answer' });
  }
};

export const nextQuestion = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const voiceSessionService = activeVoiceSessions.get(sessionId);
    if (!voiceSessionService) return res.status(404).json({ error: 'Voice session not found' });
    
    // Reset state for next question
    voiceSessionService.clearTranscript();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch next question' });
  }
};


export const getActiveVoiceSession = (sessionId: string) => {
  return activeVoiceSessions.get(sessionId);
};
