import dotenv from 'dotenv';
import path from 'path';

// Ensure env variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const voiceConfig = {
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || '',
    model: process.env.DEEPGRAM_MODEL || 'nova-2',
    language: process.env.DEEPGRAM_LANGUAGE || 'en-US',
  },
  tts: {
    provider: (process.env.TTS_PROVIDER || 'elevenlabs') as 'elevenlabs' | 'google' | 'azure',
    apiKey: process.env.TTS_API_KEY || '',
    voiceId: process.env.TTS_VOICE_ID || 'pNInz6obpgDQGcFmaJcg', // Default ElevenLabs voice
    model: process.env.TTS_MODEL || 'eleven_turbo_v2',
  },
  session: {
    silenceTimeoutMs: parseInt(process.env.VOICE_SILENCE_TIMEOUT_MS || '3000', 10),
    reconnectDelayMs: parseInt(process.env.VOICE_RECONNECT_DELAY_MS || '1000', 10),
    chunkSize: parseInt(process.env.VOICE_CHUNK_SIZE || '1024', 10),
  }
};
