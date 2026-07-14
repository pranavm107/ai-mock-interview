import { useState, useEffect, useRef, useCallback } from 'react';

export type SpeechState = 'idle' | 'connecting' | 'listening' | 'processing' | 'paused' | 'error';

export const useSpeechRecognition = (onTranscript: (text: string, isFinal: boolean) => void, sharedStream: MediaStream | null) => {
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const reconnectAttemptsRef = useRef(0);
  const chunkIndexRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setSpeechState('connecting');
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket OPEN');
      reconnectAttemptsRef.current = 0;
      setSpeechState('listening');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        console.log('MediaRecorder START');
        chunkIndexRef.current = 0;
        mediaRecorderRef.current.start(1000);
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        console.log('MediaRecorder RESUME');
        mediaRecorderRef.current.resume();
      }
    };

    ws.onmessage = (event) => {
      console.log('RAW', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'Transcript' && data.transcript) {
          console.log(`Transcript received: ${data.transcript} (isFinal=${data.isFinal})`);
          onTranscriptRef.current(data.transcript, data.isFinal);
        } else if (data.type === 'Error') {
          setError(data.message || 'Deepgram authentication failure');
          setSpeechState('error');
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    ws.onclose = () => {
      // If we intentionally closed it, don't reconnect
      if (!wsRef.current) return;
      
      // FIX: Force recorder to stop so it resets on the next ws.onopen
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        setSpeechState('connecting');
        setTimeout(() => connectWebSocket(), 1000);
      } else {
        setError('Backend unavailable');
        setSpeechState('error');
      }
    };

    ws.onerror = () => {
      setError('Network interruption');
      setSpeechState('error');
    };

    wsRef.current = ws;
  }, [onTranscript]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnect logic
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    setError(null);
    if (!sharedStream) {
      setError('Microphone access is required');
      setSpeechState('error');
      return;
    }

    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      try {
        const audioTrack = sharedStream.getAudioTracks()[0];
        if (!audioTrack) {
          setError('No audio track available');
          setSpeechState('error');
          return;
        }
        
        const speechStream = new MediaStream([audioTrack]);

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
        const mediaRecorder = new MediaRecorder(speechStream, {
          mimeType
        });
        console.log('MediaRecorder mimeType:', mediaRecorder.mimeType);

        mediaRecorder.ondataavailable = (event) => {
          const currentIndex = chunkIndexRef.current++;
          if (currentIndex === 0) {
            console.log('First ondataavailable fired!');
            const url = URL.createObjectURL(event.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = "chunk0.webm";
            a.click();
          }
          console.log(`Chunk [${currentIndex}] - size: ${event.data.size}, timecode: ${(event as any).timecode}, recorder.state: ${mediaRecorder.state}, ws.readyState: ${wsRef.current?.readyState}`);

          if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(event.data);
          } else {
            console.log(`WARNING: Chunk [${currentIndex}] dropped. size: ${event.data.size}, ws.readyState: ${wsRef.current?.readyState}`);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
      } catch (e: any) {
        setError('MediaRecorder failure');
        setSpeechState('error');
        return;
      }
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      reconnectAttemptsRef.current = 0;
      connectWebSocket();
    } else {
      setSpeechState('listening');
      if (mediaRecorderRef.current.state === 'inactive') {
        console.log('MediaRecorder START (from else)');
        chunkIndexRef.current = 0;
        mediaRecorderRef.current.start(1000);
      } else if (mediaRecorderRef.current.state === 'paused') {
        console.log('MediaRecorder RESUME (from else)');
        mediaRecorderRef.current.resume();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // We could briefly go to 'processing' here if we were waiting for the final chunk
    // But for simplicity, we immediately transition to idle and clean up.
    setSpeechState('idle');
    disconnectWebSocket();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setSpeechState('paused');
    }
  };

  const resumeRecording = () => {
    if (speechState === 'paused' || speechState === 'idle') {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    speechState,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    connectWebSocket,
    disconnectWebSocket
  };
};
