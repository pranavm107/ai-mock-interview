import type {
  IntegritySignal,
  IntegrityEventType,
  CodingStrikeState,
  StrikeResult,
  CodingStrikeLevel,
  CodingEnforcementState
} from '../../types/coding';

const STRIKE_SIGNAL_TYPES = new Set<IntegrityEventType>([
  "TAB_SWITCH",
  "WINDOW_BLUR",
  "FULLSCREEN_EXIT",
  "NAVIGATION_ATTEMPT",
]);

export class StrikeEnforcementService {
  private state: CodingStrikeState;
  private processedSignals: Set<string>;

  constructor() {
    this.processedSignals = new Set<string>();
    this.state = {
      level: 0,
      enforcementState: 'ACTIVE',
      lastStrikeAt: null,
      lastSignalType: null
    };
  }

  public getState(): CodingStrikeState {
    return { ...this.state };
  }

  public reset(): void {
    this.processedSignals.clear();
    this.state = {
      level: 0,
      enforcementState: 'ACTIVE',
      lastStrikeAt: null,
      lastSignalType: null
    };
  }

  public isTerminated(): boolean {
    return this.state.enforcementState === 'TERMINATED';
  }

  public processSignal(signal: IntegritySignal): StrikeResult {
    // If terminated, ignore new signals
    if (this.isTerminated()) {
      return {
        applied: false,
        level: this.state.level,
        enforcementState: this.state.enforcementState,
        signal
      };
    }

    // If duplicate signal, ignore
    if (this.processedSignals.has(signal.id)) {
      return {
        applied: false,
        level: this.state.level,
        enforcementState: this.state.enforcementState,
        signal
      };
    }

    // If signal type is not strike-worthy (e.g. unknown or unsupported), ignore
    if (!STRIKE_SIGNAL_TYPES.has(signal.type)) {
      return {
        applied: false,
        level: this.state.level,
        enforcementState: this.state.enforcementState,
        signal
      };
    }

    // Mark signal as processed
    this.processedSignals.add(signal.id);

    // Synchronous state transition for strike
    const newLevel = (this.state.level + 1) as CodingStrikeLevel;
    let newState: CodingEnforcementState = 'ACTIVE';

    if (newLevel === 1) {
      newState = 'WARNING';
    } else if (newLevel === 2) {
      newState = 'FINAL_WARNING';
    } else if (newLevel >= 3) {
      newState = 'TERMINATED';
    }

    this.state = {
      level: Math.min(newLevel, 3) as CodingStrikeLevel,
      enforcementState: newState,
      lastStrikeAt: new Date().toISOString(),
      lastSignalType: signal.type
    };

    return {
      applied: true,
      level: this.state.level,
      enforcementState: this.state.enforcementState,
      signal
    };
  }
}

export function createStrikeEnforcementService(): StrikeEnforcementService {
  return new StrikeEnforcementService();
}
