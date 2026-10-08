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
    HEARTBEAT_FAILURE: 0
  };

  private boundHandleVisibilityChange: () => void;
  private boundHandleWindowBlur: () => void;
  private boundHandleFullscreenChange: () => void;
  private boundHandlePopState: () => void;

  constructor(config: IntegrityDetectorConfig) {
    this.sessionId = config.sessionId;
    this.onSignal = config.onSignal;
    this.deduplicationWindowMs = config.deduplicationWindowMs || 1000; // 1 second default deduplication window

    this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundHandleWindowBlur = this.handleWindowBlur.bind(this);
    this.boundHandleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.boundHandlePopState = this.handlePopState.bind(this);
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
      document.addEventListener('fullscreenchange', this.boundHandleFullscreenChange);
      window.addEventListener('popstate', this.boundHandlePopState);
    }
  }

  public stop(): void {
    if (!this.isActive) return;
    this.isActive = false;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.boundHandleVisibilityChange);
      window.removeEventListener('blur', this.boundHandleWindowBlur);
      document.removeEventListener('fullscreenchange', this.boundHandleFullscreenChange);
      window.removeEventListener('popstate', this.boundHandlePopState);
    }
  }

  private dispatchSignal(type: IntegrityEventType, metadata?: Record<string, unknown>): void {
    const now = Date.now();
    const lastTime = this.lastSignalTime[type] || 0;

    // Deduplication check
    if (now - lastTime < this.deduplicationWindowMs) {
      return; // Deduplicated
    }

    // Advanced deduplication: If TAB_SWITCH was fired recently, suppress WINDOW_BLUR
    if (type === 'WINDOW_BLUR' && (now - this.lastSignalTime['TAB_SWITCH'] < this.deduplicationWindowMs)) {
      return; 
    }
    // Vice versa: If WINDOW_BLUR was fired recently, suppress TAB_SWITCH (less common but possible)
    if (type === 'TAB_SWITCH' && (now - this.lastSignalTime['WINDOW_BLUR'] < this.deduplicationWindowMs)) {
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
    }
  }

  private handleWindowBlur(): void {
    this.dispatchSignal('WINDOW_BLUR', { source: 'window' });
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
}

export function createIntegrityDetector(config: IntegrityDetectorConfig): IntegrityDetectionService {
  return new IntegrityDetectionService(config);
}
