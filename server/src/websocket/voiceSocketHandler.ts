import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getActiveVoiceSession } from '../controllers/voiceController';
import { VoiceEvent } from '../types/voice';

export const setupVoiceSocket = (server: HttpServer) => {
  const wss = new WebSocketServer({ server, path: '/api/voice/socket' });

  wss.on('connection', (ws: WebSocket, req) => {
    // Basic session extraction from url or protocol, usually passed in url query like ?sessionId=...
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      ws.send(JSON.stringify({ type: 'Error', message: 'Missing sessionId' }));
      ws.close();
      return;
    }

    const voiceSessionService = getActiveVoiceSession(sessionId);
    
    if (!voiceSessionService) {
      ws.send(JSON.stringify({ type: 'Error', message: 'Voice session not active' }));
      ws.close();
      return;
    }

    console.log(`Client connected to voice socket for session ${sessionId}`);

    // Listen to voice service events and forward to client
    const handleTranscript = (data: any) => ws.send(JSON.stringify({ type: VoiceEvent.TRANSCRIPT, data }));
    const handleSilence = (data: any) => ws.send(JSON.stringify({ type: VoiceEvent.USER_PAUSED, data }));
    const handleAiSpeaking = () => ws.send(JSON.stringify({ type: VoiceEvent.AI_SPEAKING }));
    const handleAiFinished = () => ws.send(JSON.stringify({ type: VoiceEvent.AI_FINISHED }));
    const handleUserStarted = () => ws.send(JSON.stringify({ type: VoiceEvent.USER_STARTED }));

    voiceSessionService.on(VoiceEvent.TRANSCRIPT, handleTranscript);
    voiceSessionService.on(VoiceEvent.USER_PAUSED, handleSilence);
    voiceSessionService.on(VoiceEvent.AI_SPEAKING, handleAiSpeaking);
    voiceSessionService.on(VoiceEvent.AI_FINISHED, handleAiFinished);
    voiceSessionService.on(VoiceEvent.USER_STARTED, handleUserStarted);

    ws.on('message', (message: any) => {
      const buffer = Buffer.isBuffer(message) ? message : Buffer.from(message as ArrayBuffer);
      voiceSessionService.processAudioChunk(buffer);
    });

    ws.on('close', () => {
      console.log(`Client disconnected from voice socket for session ${sessionId}`);
      // Clean up event listeners
      voiceSessionService.off(VoiceEvent.TRANSCRIPT, handleTranscript);
      voiceSessionService.off(VoiceEvent.USER_PAUSED, handleSilence);
      voiceSessionService.off(VoiceEvent.AI_SPEAKING, handleAiSpeaking);
      voiceSessionService.off(VoiceEvent.AI_FINISHED, handleAiFinished);
      voiceSessionService.off(VoiceEvent.USER_STARTED, handleUserStarted);
    });
  });
};
