import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { setupDeepgramService } from '../services/deepgramService';
import { LiveTranscriptionEvents } from '@deepgram/sdk';

export const setupDeepgramSocket = (server: HttpServer) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to websocket');
    let deepgramLive: ReturnType<typeof setupDeepgramService> | null = null;
    let keepAliveInterval: ReturnType<typeof setInterval> | null = null;
    let bufferArray: any[] = [];
    let isDeepgramReady = false;

    try {
      deepgramLive = setupDeepgramService();

      deepgramLive.on(LiveTranscriptionEvents.Open, () => {
        console.log('DG OPEN');
        isDeepgramReady = true;

        if (bufferArray.length > 0) {
          console.log(`Flushing ${bufferArray.length} buffered chunks to Deepgram`);
          for (const buf of bufferArray) {
            deepgramLive?.send(buf);
          }
          bufferArray = [];
        }

        ws.send(JSON.stringify({ type: 'Status', message: 'Deepgram connected' }));

        keepAliveInterval = setInterval(() => {
          deepgramLive?.keepAlive();
        }, 10 * 1000);
      });

      deepgramLive.on(LiveTranscriptionEvents.Transcript, (data) => {
        console.log('DG TRANSCRIPT', JSON.stringify(data, null, 2));
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final;
        if (transcript) {
          console.log(`Sending transcript: ${transcript}`);
          ws.send(JSON.stringify({
            type: 'Transcript',
            transcript,
            isFinal
          }));
        }
      });

      deepgramLive.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('DG ERROR', err);
        ws.send(JSON.stringify({ type: 'Error', message: 'Deepgram error occurred' }));
      });

      deepgramLive.on(LiveTranscriptionEvents.Metadata, (metadata) => {
        console.log('DG METADATA', metadata);
      });

      deepgramLive.on(LiveTranscriptionEvents.Unhandled, (unhandled) => {
        console.log('DG UNHANDLED', unhandled);
      });

      deepgramLive.on(LiveTranscriptionEvents.Close, () => {
        console.log('DG CLOSED');
        if (keepAliveInterval) clearInterval(keepAliveInterval);
      });
    } catch (err) {
      console.error('Failed to setup Deepgram service:', err);
      ws.send(JSON.stringify({ type: 'Error', message: 'Deepgram setup failed' }));
    }

    ws.on('message', (message: any) => {
      // Received audio data from the client, pipe it to deepgram
      if (deepgramLive) {
        let bufferToSend: any;
        if (Buffer.isBuffer(message)) {
          bufferToSend = message;
        } else if (message instanceof ArrayBuffer) {
          bufferToSend = Buffer.from(message);
        } else if (typeof message === 'string') {
          try {
            JSON.parse(message);
            bufferToSend = Buffer.from(message); 
          } catch {
            bufferToSend = Buffer.from(message, 'base64');
          }
        } else {
          // Fallback
          bufferToSend = Buffer.from(message as any);
        }

        if (isDeepgramReady && deepgramLive.getReadyState() === 1) { // 1 = OPEN
          console.log('Audio Chunk Received -> Sent to Deepgram (size: ' + bufferToSend.length + ')');
          deepgramLive.send(bufferToSend as any);
        } else {
          console.log('Audio Chunk Received -> Buffered (size: ' + bufferToSend.length + ')');
          bufferArray.push(bufferToSend);
        }
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (deepgramLive) {
        deepgramLive.requestClose();
      }
    });
  });
};
