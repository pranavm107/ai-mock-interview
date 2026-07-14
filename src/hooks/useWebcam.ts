import { useState, useRef, useEffect, useCallback } from 'react';

export type WebcamState = 'ready' | 'camera_on' | 'recording' | 'paused' | 'error';

export const useWebcam = () => {
  const [webcamState, setWebcamState] = useState<WebcamState>('ready');
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Prevent feedback loop in local preview
      }

      setIsCameraEnabled(true);
      setWebcamState('camera_on');
      setError(null);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied');
      } else {
        setError('Failed to access camera: ' + err.message);
      }
      setWebcamState('error');
    }
  };

  const stopCamera = useCallback(() => {
    stopMediaRecorder();
    stopAllTracks();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraEnabled(false);
    setWebcamState('ready');
  }, [stopMediaRecorder, stopAllTracks]);

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!audioTracks[0]?.enabled);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };

      mediaRecorder.start(1000); // 1-second chunks to ensure we don't lose data
      mediaRecorderRef.current = mediaRecorder;
      setWebcamState('recording');
    } catch (err: any) {
      setError('Failed to start recording: ' + err.message);
      setWebcamState('error');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setWebcamState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setWebcamState('recording');
    }
  };

  const stopRecording = () => {
    stopMediaRecorder();
    setWebcamState('camera_on');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaRecorder();
      stopAllTracks();
    };
  }, [stopMediaRecorder, stopAllTracks]);

  return {
    videoRef,
    webcamState,
    isCameraEnabled,
    isMuted,
    isRecording: webcamState === 'recording',
    isPaused: webcamState === 'paused',
    error,
    videoBlob,
    videoUrl,
    startCamera,
    stopCamera,
    toggleMute,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    stream: streamRef.current
  };
};
