import { voiceConfig } from '../../config/voiceConfig';

export interface TTSProvider {
  generateSpeech(text: string): Promise<Buffer>;
}

export class ElevenLabsProvider implements TTSProvider {
  async generateSpeech(text: string): Promise<Buffer> {
    const { apiKey, voiceId, model } = voiceConfig.tts;
    
    if (!apiKey) {
      console.warn('ElevenLabs API key is missing, returning empty audio buffer.');
      return Buffer.from('');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

export class TTSService {
  private provider: TTSProvider;

  constructor() {
    // We can easily switch providers based on config here
    switch (voiceConfig.tts.provider) {
      case 'elevenlabs':
      default:
        this.provider = new ElevenLabsProvider();
        break;
    }
  }

  /**
   * Generates audio for a given text.
   * Returns a Buffer containing the audio (e.g., MP3 format).
   */
  public async generateAudio(text: string): Promise<Buffer> {
    try {
      return await this.provider.generateSpeech(text);
    } catch (error) {
      console.error('TTS Generation Error:', error);
      throw error;
    }
  }
}
