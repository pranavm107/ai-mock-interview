import { DeepgramSocketService } from './deepgramSocketService';
import { TTSService } from './ttsService';
import { AudioStreamService } from './audioStreamService';
import { SilenceDetectionService } from './silenceDetectionService';
import { VoiceSession, VoiceSessionStatus, VoiceEvent } from '../../types/voice';
import { EventEmitter } from 'events';
import crypto from 'crypto';

export class VoiceSessionService extends EventEmitter {
  private session: VoiceSession;
  private deepgramService: DeepgramSocketService;
  private ttsService: TTSService;
  private audioStreamService: AudioStreamService;
  private silenceDetectionService: SilenceDetectionService;
  
  constructor(sessionId: string) {
    super();
    this.session = {
      id: crypto.randomUUID(),
      sessionId,
      status: VoiceSessionStatus.INITIALIZING,
      microphoneState: 'unmuted',
      speakerState: 'unmuted',
      currentTranscript: '',
      currentWords: [],
      language: 'en-US',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.deepgramService = new DeepgramSocketService();
    this.audioStreamService = new AudioStreamService(this.deepgramService);
    this.ttsService = new TTSService();
    this.silenceDetectionService = new SilenceDetectionService();

    this.setupListeners();
  }

  private setupListeners() {
    this.deepgramService.on(VoiceEvent.TRANSCRIPT, (data) => {
      const { transcript, words, isFinal, speechFinal } = data;
      
      if (isFinal) {
        if (transcript.trim()) {
          this.session.currentTranscript += (this.session.currentTranscript ? ' ' : '') + transcript;
          if (words && Array.isArray(words)) {
            // Adjust timestamps of incoming words if we have a continuously running session
            // For now, just push them.
            this.session.currentWords.push(...words);
          }
        }
        this.session.updatedAt = new Date().toISOString();
        this.emit(VoiceEvent.TRANSCRIPT, { transcript: this.session.currentTranscript, isFinal: true });
        
        if (speechFinal) {
          // Deepgram says speech is final, trigger USER_PAUSED immediately
          this.emit(VoiceEvent.USER_PAUSED);
        } else {
          this.silenceDetectionService.onSpeechPause();
        }
      } else {
        const interimTranscript = this.session.currentTranscript 
          ? this.session.currentTranscript + (transcript.trim() ? ' ' + transcript : '')
          : transcript;
        this.emit(VoiceEvent.TRANSCRIPT, { transcript: interimTranscript, isFinal: false });
        this.silenceDetectionService.onSpeechStart();
      }
    });

    this.deepgramService.on(VoiceEvent.CONNECTION_RESTORED, () => {
      this.silenceDetectionService.startListening();
      this.emit(VoiceEvent.CONNECTION_RESTORED);
    });

    this.deepgramService.on(VoiceEvent.CONNECTION_LOST, () => this.emit(VoiceEvent.CONNECTION_LOST));
    this.deepgramService.on(VoiceEvent.ERROR, (err) => this.emit(VoiceEvent.ERROR, err));

    this.silenceDetectionService.on(VoiceEvent.USER_PAUSED, () => {
      this.emit(VoiceEvent.USER_PAUSED);
    });
  }

  public async startSession() {
    this.session.status = VoiceSessionStatus.ACTIVE;
    this.deepgramService.connect();
    this.emit('statusChanged', this.session.status);
  }

  public stopSession() {
    this.session.status = VoiceSessionStatus.COMPLETED;
    this.silenceDetectionService.stopListening();
    this.deepgramService.disconnect();
    this.emit('statusChanged', this.session.status);
  }

  public processAudioChunk(chunk: Buffer) {
    if (this.session.microphoneState === 'unmuted' && this.session.status === VoiceSessionStatus.ACTIVE) {
      this.audioStreamService.processIncomingAudio(chunk);
    }
  }

  public async speak(text: string): Promise<Buffer | null> {
    if (this.session.speakerState === 'muted') return null;
    
    this.emit(VoiceEvent.AI_SPEAKING);
    // Pause listening while AI is speaking
    this.silenceDetectionService.stopListening();
    
    try {
      const audioBuffer = await this.ttsService.generateAudio(text);
      this.emit(VoiceEvent.AI_FINISHED);
      // Resume listening
      this.silenceDetectionService.startListening();
      return audioBuffer;
    } catch (error) {
      this.emit(VoiceEvent.ERROR, error);
      this.silenceDetectionService.startListening();
      return null;
    }
  }

  public muteMicrophone() {
    this.session.microphoneState = 'muted';
    this.emit(VoiceEvent.MIC_MUTED);
  }

  public unmuteMicrophone() {
    this.session.microphoneState = 'unmuted';
    this.emit(VoiceEvent.MIC_UNMUTED);
  }

  public getSession(): VoiceSession {
    return this.session;
  }

  public clearTranscript() {
    this.session.currentTranscript = '';
    this.session.currentWords = [];
    this.emit(VoiceEvent.TRANSCRIPT, { transcript: '', isFinal: true });
  }

  public getCurrentTranscript(): string {
    return this.session.currentTranscript;
  }
  
  public getCurrentWords(): any[] {
    return this.session.currentWords;
  }
}
