import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { voiceConfig } from '../../config/voiceConfig';
import { EventEmitter } from 'events';
import { VoiceEvent } from '../../types/voice';

export class DeepgramSocketService extends EventEmitter {
  private deepgram: ReturnType<typeof createClient>;
  private liveClient: LiveClient | null = null;
  private keepAliveTimer: NodeJS.Timeout | null = null;
  private shouldReconnect = true;
  private pendingChunks: Buffer[] = [];

  constructor() {
    super();
    this.deepgram = createClient(voiceConfig.deepgram.apiKey);
  }

  public connect() {
    this.shouldReconnect = true;

    if (this.liveClient) {
      this.cleanup();
    }

    this.liveClient = this.deepgram.listen.live({
      model: voiceConfig.deepgram.model,
      language: voiceConfig.deepgram.language,
      smart_format: true,
      interim_results: true,
      endpointing: 300,
      encoding: 'linear16',
      sample_rate: 16000,
      channels: 1
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.liveClient) return;

    this.liveClient.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram connection opened');
      this.emit(VoiceEvent.CONNECTION_RESTORED);
      
      for (const chunk of this.pendingChunks) {
        console.log(`Sending pending chunk: ${chunk.length} bytes`);
        this.liveClient?.send(chunk as any);
      }
      this.pendingChunks = [];

      // Send a KeepAlive message every 10 seconds to keep connection open
      this.keepAliveTimer = setInterval(() => {
        this.liveClient?.keepAlive();
      }, 10 * 1000);
    });

    this.liveClient.on(LiveTranscriptionEvents.Transcript, (data) => {
      console.log('Transcript Event:', JSON.stringify(data, null, 2));
      if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
        const transcript = data.channel.alternatives[0].transcript;
        const words = data.channel.alternatives[0].words || [];
        const isFinal = data.is_final;
        const speechFinal = data.speech_final;
        
        if (transcript.trim().length > 0) {
          this.emit(VoiceEvent.TRANSCRIPT, { transcript, words, isFinal, speechFinal });
        }
      }
    });

    this.liveClient.on(LiveTranscriptionEvents.Metadata, (metadata) => {
      console.log('Deepgram Metadata:', metadata);
    });

    this.liveClient.on(LiveTranscriptionEvents.Error, (err) => {
      console.error('Deepgram Error:', err);
      this.emit(VoiceEvent.ERROR, err);
    });

    this.liveClient.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed');
      this.emit(VoiceEvent.CONNECTION_LOST);
      this.cleanup();
      
      if (!this.shouldReconnect) return;

      // Auto-reconnect after delay
      setTimeout(() => {
        this.connect();
      }, voiceConfig.session.reconnectDelayMs);
    });
  }

  public sendAudio(chunk: Buffer) {
    if (!this.liveClient) return;

    console.log(`Sending audio chunk: ${chunk.length} bytes, Deepgram ReadyState: ${this.liveClient.getReadyState()}`);

    if (this.liveClient.getReadyState() !== 1 /* OPEN */) {
      this.pendingChunks.push(chunk);
      return;
    }

    this.liveClient.send(chunk as any);
  }

  public disconnect() {
    this.shouldReconnect = false;
    if (this.liveClient) {
      this.liveClient.finish();
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
    this.liveClient = null;
  }
}
