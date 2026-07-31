import { useState, useEffect, useRef, useCallback } from 'react';

export type InterviewState = 'READY' | 'LISTENING' | 'PAUSED' | 'SUBMITTING' | 'SCORING' | 'SHOW_FEEDBACK' | 'NEXT_QUESTION' | 'GENERATING_REPORT' | 'REPORT_READY' | 'REPORT_PENDING' | 'COMPLETED';

export interface VoiceState {
  isSpeaking: boolean;
  interviewState: InterviewState;
  transcript: string;
  isMuted: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export interface VoiceInterviewOptions {
  onFinishAnswer?: (transcript: string) => void;
  onNextQuestion?: () => void;
}

export function useVoiceInterview(sessionId: string | undefined, options?: VoiceInterviewOptions) {
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const [state, setState] = useState<VoiceState>({
    isSpeaking: false,
    interviewState: 'READY',
    transcript: '',
    isMuted: false,
    connectionStatus: 'disconnected',
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Sync microphone track enabled state with isMuted and isSpeaking
  useEffect(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !(state.isMuted || state.isSpeaking);
      }
    }
  }, [state.isMuted, state.isSpeaking]);



  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
  }, []);

  const startVoice = async () => {
    try {
      if (!sessionId) return;
      
      // Start session on backend
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${backendUrl}/api/voice/session/${sessionId}/start`, { method: 'POST' });

      // Return a promise to wait for WS to connect
      await new Promise<void>((resolve, reject) => {
        const wsUrl = backendUrl.replace(/^http/, 'ws') + `/api/voice/socket?sessionId=${sessionId}`;

        setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected, ReadyState:', ws.readyState);
          setState(prev => ({ ...prev, connectionStatus: 'connected' }));
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'TRANSCRIPT':
                setState(prev => ({ ...prev, transcript: data.data.transcript, isListening: !data.data.isFinal }));
                break;
              case 'SILENCE_DETECTED':
                setState(prev => ({ ...prev, isListening: false }));
                break;
              case 'AI_SPEAKING':
                setState(prev => ({ ...prev, isSpeaking: true, isListening: false }));
                break;
              case 'AI_FINISHED':
                setState(prev => ({ ...prev, isSpeaking: false, isListening: true }));
                break;
              case 'USER_STARTED':
                setState(prev => ({ ...prev, isListening: true }));
                break;
              case 'Error':
                console.error('Voice Socket Error:', data.message);
                setState(prev => ({ ...prev, connectionStatus: 'error' }));
                break;
            }
          } catch (e) {
            console.error('Error parsing WebSocket message', e);
          }
        };

        ws.onclose = () => {
          setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        };

        ws.onerror = (e) => {
          setState(prev => ({ ...prev, connectionStatus: 'error' }));
          reject(e);
        };
      });

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // Deprecated but works everywhere without needing separate worklet files
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const currentState = stateRef.current;
        if (wsRef.current?.readyState === WebSocket.OPEN && !currentState.isMuted && !currentState.isSpeaking) {
          const float32Array = e.inputBuffer.getChannelData(0);
          const int16Array = new Int16Array(float32Array.length);
          for (let i = 0; i < float32Array.length; i++) {
             const s = Math.max(-1, Math.min(1, float32Array[i]));
             int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          wsRef.current.send(int16Array.buffer);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      processorRef.current = processor;

      setState(prev => ({ ...prev, connectionStatus: 'connected' }));

    } catch (error) {
      console.error('Error starting voice interaction:', error);
      setState(prev => ({ ...prev, connectionStatus: 'error' }));
    }
  };


  const stopVoice = useCallback(async () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    disconnectWebSocket();
    setState(prev => ({ ...prev, interviewState: 'READY', isSpeaking: false }));
    
    if (sessionId) {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      fetch(`${backendUrl}/api/voice/session/${sessionId}/stop`, { method: 'POST' }).catch(console.error);
    }
  }, [sessionId, disconnectWebSocket]);

  const startAnswer = async () => {
    if (!sessionId) return;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/api/voice/session/${sessionId}/start-answer`, { method: 'POST' }).catch(console.error);
    setState(prev => ({ ...prev, interviewState: 'LISTENING', transcript: '' }));
  };

  const finishAnswer = async () => {
    if (!sessionId) return;
    setState(prev => ({ ...prev, interviewState: 'SUBMITTING' }));
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/api/voice/session/${sessionId}/finish-answer`, { method: 'POST' }).catch(console.error);
    if (optionsRef.current?.onFinishAnswer) {
      optionsRef.current.onFinishAnswer(stateRef.current.transcript);
    }
  };

  const restartAnswer = async () => {
    if (!sessionId) return;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/api/voice/session/${sessionId}/restart-answer`, { method: 'POST' }).catch(console.error);
    setState(prev => ({ ...prev, transcript: '', interviewState: 'LISTENING' }));
  };

  const nextQuestion = async () => {
    if (!sessionId) return;
    setState(prev => ({ ...prev, interviewState: 'NEXT_QUESTION' }));
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${backendUrl}/api/voice/session/${sessionId}/next-question`, { method: 'POST' }).catch(console.error);
    if (optionsRef.current?.onNextQuestion) {
      optionsRef.current.onNextQuestion();
    }
    setState(prev => ({ ...prev, transcript: '', interviewState: 'READY' }));
  };

  const toggleMute = () => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const replayQuestion = async (text: string) => {
    if (!sessionId) return;
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/voice/session/${sessionId}/replay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`Replay request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        setState(prev => ({ ...prev, isSpeaking: true }));
        audio.onended = () => setState(prev => ({ ...prev, isSpeaking: false }));
        audio.play();
      }
    } catch (error) {
      console.error('Error replaying question:', error);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopVoice();
    };
  }, [sessionId, stopVoice]);

  return {
    ...state,
    startVoice,
    stopVoice,
    startAnswer,
    finishAnswer,
    restartAnswer,
    nextQuestion,
    toggleMute,
    replayQuestion,
    setInterviewState: (s: InterviewState) => setState(prev => ({ ...prev, interviewState: s }))
  };
}
