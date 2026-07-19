import { EventEmitter } from 'events';
import { voiceConfig } from '../../config/voiceConfig';
import { VoiceEvent } from '../../types/voice';

export class SilenceDetectionService extends EventEmitter {
  private silenceTimer: NodeJS.Timeout | null = null;
  private isListening: boolean = false;
  
  constructor() {
    super();
  }

  public startListening() {
    this.isListening = true;
    this.resetSilenceTimer();
  }

  public stopListening() {
    this.isListening = false;
    this.clearSilenceTimer();
  }

  public onSpeechStart() {
    if (!this.isListening) return;
    this.clearSilenceTimer();
    this.emit(VoiceEvent.USER_STARTED);
  }

  public onSpeechPause() {
    if (!this.isListening) return;
    this.resetSilenceTimer();
  }

  private resetSilenceTimer() {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      this.emit(VoiceEvent.USER_PAUSED);
      // We no longer automatically stop listening when the user pauses
    }, voiceConfig.session.silenceTimeoutMs);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
}
