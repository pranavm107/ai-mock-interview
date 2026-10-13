import type { IntegritySignal, IntegrityEventType } from '../../types/coding';


export interface IntegrityCapabilities {
  visibilityApi: boolean;
  focusEvents: boolean;
  fullscreenApi: boolean;
  historyApi: boolean;
}

export interface IntegrityDetectorConfig {
  sessionId: string;
  onSignal: (signal: IntegritySignal) => void;
  deduplicationWindowMs?: number;
}

export class IntegrityDetectionService {
  private sessionId: string;
  private onSignal: (signal: IntegritySignal) => void;
  private deduplicationWindowMs: number;
  private isActive: boolean = false;

  private lastSignalTime: Record<IntegrityEventType, number> = {
    TAB_SWITCH: 0,
    WINDOW_BLUR: 0,
    FULLSCREEN_EXIT: 0,
    NAVIGATION_ATTEMPT: 0,
    HEARTBEAT_FAILURE: 0,
    COPY_DETECTED: 0,
    PASTE_DETECTED: 0,
    CUT_DETECTED: 0,
    TAB_RETURN: 0,
    WINDOW_FOCUS: 0,
    LARGE_CODE_INSERTION: 0
  };

  private boundHandleVisibilityChange: () => void;
  private boundHandleWindowBlur: () => void;
  private boundHandleWindowFocus: () => void;
  private boundHandleFullscreenChange: () => void;
  private boundHandlePopState: () => void;
  private boundHandleCopy: (e: ClipboardEvent) => void;
  private boundHandlePaste: (e: ClipboardEvent) => void;
  private boundHandleCut: (e: ClipboardEvent) => void;
  private boundHandleMessage: (e: MessageEvent) => void;

  constructor(config: IntegrityDetectorConfig) {
    this.sessionId = config.sessionId;
    this.onSignal = config.onSignal;
    this.deduplicationWindowMs = config.deduplicationWindowMs || 1000; // 1 second default deduplication window

    this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundHandleWindowBlur = this.handleWindowBlur.bind(this);
    this.boundHandleWindowFocus = this.handleWindowFocus.bind(this);
    this.boundHandleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.boundHandlePopState = this.handlePopState.bind(this);
    this.boundHandleCopy = this.handleCopy.bind(this);
    this.boundHandlePaste = this.handlePaste.bind(this);
    this.boundHandleCut = this.handleCut.bind(this);
    this.boundHandleMessage = this.handleMessage.bind(this);
  }

  public getCapabilities(): IntegrityCapabilities {
    return {
      visibilityApi: typeof document !== 'undefined' && typeof document.hidden !== 'undefined',
      focusEvents: typeof window !== 'undefined' && typeof window.onblur !== 'undefined',
      fullscreenApi: typeof document !== 'undefined' && typeof document.fullscreenElement !== 'undefined',
      historyApi: typeof window !== 'undefined' && typeof window.history !== 'undefined'
    };
  }

  public start(): void {
    if (this.isActive) return; // Prevent double start
    this.isActive = true;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.boundHandleVisibilityChange);
      window.addEventListener('blur', this.boundHandleWindowBlur);
      window.addEventListener('focus', this.boundHandleWindowFocus);
      document.addEventListener('fullscreenchange', this.boundHandleFullscreenChange);
      window.addEventListener('popstate', this.boundHandlePopState);
      document.addEventListener('copy', this.boundHandleCopy);
      document.addEventListener('paste', this.boundHandlePaste);
      document.addEventListener('cut', this.boundHandleCut);
      
      // DISABLED: Message bridge cannot securely distinguish extension events from page-forged events.
      // window.addEventListener('message', this.boundHandleMessage);
      
      // Notify extension that session is active
      window.postMessage({ type: 'PREPPILOT_SESSION_STATE', isActive: true }, window.origin);
    }
  }

  public stop(): void {
    if (!this.isActive) return;
    this.isActive = false;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.boundHandleVisibilityChange);
      window.removeEventListener('blur', this.boundHandleWindowBlur);
      window.removeEventListener('focus', this.boundHandleWindowFocus);
      document.removeEventListener('fullscreenchange', this.boundHandleFullscreenChange);
      window.removeEventListener('popstate', this.boundHandlePopState);
      document.removeEventListener('copy', this.boundHandleCopy);
      document.removeEventListener('paste', this.boundHandlePaste);
      document.removeEventListener('cut', this.boundHandleCut);
      
      // DISABLED: Message bridge cannot securely distinguish extension events from page-forged events.
      // window.removeEventListener('message', this.boundHandleMessage);

      // Notify extension that session is inactive
      window.postMessage({ type: 'PREPPILOT_SESSION_STATE', isActive: false }, window.origin);
    }
  }

  private dispatchSignal(type: IntegrityEventType, metadata?: Record<string, unknown>): void {
    const now = Date.now();
    const lastTime = this.lastSignalTime[type] || 0;

    // Deduplication check
    if (now - lastTime < this.deduplicationWindowMs) {
      return; // Deduplicated
    }

    // Advanced deduplication for simultaneous blur/switch/fullscreen
    const nearTabSwitch = (now - this.lastSignalTime['TAB_SWITCH'] < this.deduplicationWindowMs);
    const nearWindowBlur = (now - this.lastSignalTime['WINDOW_BLUR'] < this.deduplicationWindowMs);
    const nearFullscreenExit = (now - this.lastSignalTime['FULLSCREEN_EXIT'] < this.deduplicationWindowMs);

    if (type === 'WINDOW_BLUR' && (nearTabSwitch || nearFullscreenExit)) {
      return; 
    }
    if (type === 'TAB_SWITCH' && (nearWindowBlur || nearFullscreenExit)) {
      return;
    }
    if (type === 'FULLSCREEN_EXIT' && (nearTabSwitch || nearWindowBlur)) {
      return;
    }
    
    // Deduplicate return signals as well
    if (type === 'WINDOW_FOCUS' && (now - this.lastSignalTime['TAB_RETURN'] < this.deduplicationWindowMs)) {
      return;
    }
    if (type === 'TAB_RETURN' && (now - this.lastSignalTime['WINDOW_FOCUS'] < this.deduplicationWindowMs)) {
      return;
    }

    // Deduplicate bulk insertion against paste (since paste triggers both)
    if (type === 'LARGE_CODE_INSERTION' && (now - this.lastSignalTime['PASTE_DETECTED'] < this.deduplicationWindowMs)) {
      return;
    }

    this.lastSignalTime[type] = now;

    const signal: IntegritySignal = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      type,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      metadata
    };

    this.onSignal(signal);
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      this.dispatchSignal('TAB_SWITCH', { visibilityState: 'hidden' });
    } else if (document.visibilityState === 'visible') {
      this.dispatchSignal('TAB_RETURN', { visibilityState: 'visible' });
    }
  }

  private handleWindowBlur(): void {
    this.dispatchSignal('WINDOW_BLUR', { source: 'window' });
  }

  private handleWindowFocus(): void {
    this.dispatchSignal('WINDOW_FOCUS', { source: 'window' });
  }

  private handleFullscreenChange(): void {
    // Only detect if we are active AND fullscreen was dropped.
    // When the session starts, we enter fullscreen FIRST, then become ACTIVE.
    // So if ACTIVE and fullscreen is null, it's an exit.
    if (!document.fullscreenElement) {
      this.dispatchSignal('FULLSCREEN_EXIT', { fullscreenElementPresent: false });
    }
  }

  private handlePopState(): void {
    this.dispatchSignal('NAVIGATION_ATTEMPT', { source: 'history' });
  }

  private handleCopy(e: ClipboardEvent): void {
    // Determine context safely without extracting data
    const target = e.target as HTMLElement;
    this.dispatchSignal('COPY_DETECTED', {
      targetTag: target?.tagName || 'UNKNOWN'
    });
  }

  private handlePaste(e: ClipboardEvent): void {
    const target = e.target as HTMLElement;
    this.dispatchSignal('PASTE_DETECTED', {
      targetTag: target?.tagName || 'UNKNOWN'
    });
  }

  public reportEditorPaste(): void {
    if (!this.isActive) return;
    this.dispatchSignal('PASTE_DETECTED', {
      targetTag: 'MONACO_EDITOR'
    });
  }

  public reportLargeInsertion(length: number): void {
    if (!this.isActive) return;
    this.dispatchSignal('LARGE_CODE_INSERTION', {
      length
    });
  }

  private handleCut(e: ClipboardEvent): void {
    const target = e.target as HTMLElement;
    this.dispatchSignal('CUT_DETECTED', {
      targetTag: target?.tagName || 'UNKNOWN'
    });
  }

  private handleMessage(e: MessageEvent): void {
    // Bridge is currently disabled due to forging risks.
    // If enabled in the future, it must strictly validate source and origin:
    if (e.source !== window) return;
    if (e.origin !== window.origin) return;

    if (e.data && e.data.type === 'PREPPILOT_INTEGRITY_SIGNAL') {
      const allowedTypes = ['TAB_SWITCH', 'WINDOW_BLUR'];
      if (allowedTypes.includes(e.data.signalType)) {
        this.dispatchSignal(e.data.signalType as IntegrityEventType, e.data.metadata);
      }
    }
  }
}

export function createIntegrityDetector(config: IntegrityDetectorConfig): IntegrityDetectionService {
  return new IntegrityDetectionService(config);
}
