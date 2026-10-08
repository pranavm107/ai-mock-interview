import { describe, it, expect, beforeEach } from 'vitest';
import { StrikeEnforcementService, createStrikeEnforcementService } from './strikeEnforcementService';
import type { IntegritySignal } from '../../types/coding';

describe('StrikeEnforcementService', () => {
  let engine: StrikeEnforcementService;

  beforeEach(() => {
    engine = createStrikeEnforcementService();
  });

  const createSignal = (type: any, id: string = Math.random().toString()): IntegritySignal => ({
    id,
    type,
    timestamp: new Date().toISOString(),
    sessionId: 'test-session'
  });

  it('Test 1 - Initial state', () => {
    const state = engine.getState();
    expect(state.level).toBe(0);
    expect(state.enforcementState).toBe('ACTIVE');
  });

  it('Test 2 - First signal', () => {
    const res = engine.processSignal(createSignal('TAB_SWITCH'));
    expect(res.applied).toBe(true);
    expect(res.level).toBe(1);
    expect(res.enforcementState).toBe('WARNING');
    
    const state = engine.getState();
    expect(state.level).toBe(1);
    expect(state.enforcementState).toBe('WARNING');
  });

  it('Test 3 - Second signal', () => {
    engine.processSignal(createSignal('TAB_SWITCH'));
    const res = engine.processSignal(createSignal('WINDOW_BLUR'));
    expect(res.applied).toBe(true);
    expect(res.level).toBe(2);
    expect(res.enforcementState).toBe('FINAL_WARNING');
  });

  it('Test 4 - Third signal', () => {
    engine.processSignal(createSignal('TAB_SWITCH'));
    engine.processSignal(createSignal('WINDOW_BLUR'));
    const res = engine.processSignal(createSignal('FULLSCREEN_EXIT'));
    expect(res.applied).toBe(true);
    expect(res.level).toBe(3);
    expect(res.enforcementState).toBe('TERMINATED');
    expect(engine.isTerminated()).toBe(true);
  });

  it('Test 5 - Fourth signal', () => {
    engine.processSignal(createSignal('TAB_SWITCH'));
    engine.processSignal(createSignal('WINDOW_BLUR'));
    engine.processSignal(createSignal('FULLSCREEN_EXIT'));
    const res = engine.processSignal(createSignal('NAVIGATION_ATTEMPT'));
    
    expect(res.applied).toBe(false);
    expect(res.level).toBe(3);
    expect(res.enforcementState).toBe('TERMINATED');
  });

  it('Test 6 - Duplicate signal', () => {
    const signal = createSignal('TAB_SWITCH', 'duplicate-123');
    const res1 = engine.processSignal(signal);
    const res2 = engine.processSignal(signal);

    expect(res1.applied).toBe(true);
    expect(res2.applied).toBe(false);
    expect(engine.getState().level).toBe(1);
  });

  it('Test 7 - Non-strike signal', () => {
    const res = engine.processSignal(createSignal('UNKNOWN_TYPE' as any));
    expect(res.applied).toBe(false);
    expect(engine.getState().level).toBe(0);
  });

  it('Test 8 - Reset', () => {
    engine.processSignal(createSignal('TAB_SWITCH'));
    engine.reset();
    const state = engine.getState();
    expect(state.level).toBe(0);
    expect(state.enforcementState).toBe('ACTIVE');
  });

  it('Test 9 - Terminated reset protection (engine is manually reset, but in UI we guard)', () => {
    engine.processSignal(createSignal('TAB_SWITCH'));
    engine.processSignal(createSignal('WINDOW_BLUR'));
    engine.processSignal(createSignal('FULLSCREEN_EXIT'));
    
    // Engine reset works internally, UI should avoid calling it.
    engine.reset();
    expect(engine.getState().level).toBe(0);
  });

  it('Test 10 - Maximum boundary', () => {
    for (let i = 0; i < 10; i++) {
      engine.processSignal(createSignal('TAB_SWITCH'));
    }
    const state = engine.getState();
    expect(state.level).toBe(3);
    expect(state.enforcementState).toBe('TERMINATED');
  });
});
