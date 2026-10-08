// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IntegrityDetectionService, createIntegrityDetector } from './integrityDetectionService';
import type { IntegritySignal, IntegrityEventType } from '../../types/coding';

describe('IntegrityDetectionService', () => {
  let detector: IntegrityDetectionService;
  let signals: IntegritySignal[] = [];

  beforeEach(() => {
    signals = [];
    detector = createIntegrityDetector({
      sessionId: 'test-session-123',
      onSignal: (s) => signals.push(s),
      deduplicationWindowMs: 500
    });

    // Mock DOM environment APIs if not present (jsdom is usually active)
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true
    });
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.createElement('div'),
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    detector.stop();
    vi.restoreAllMocks();
  });

  it('Test 1 - Initial: no listeners, no signals', () => {
    document.dispatchEvent(new Event('visibilitychange'));
    expect(signals.length).toBe(0);
  });

  it('Test 2 - Start: registers listeners', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    detector.start();
    expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('fullscreenchange', expect.any(Function));
  });

  it('Test 3 - Tab switch: correctly dispatches TAB_SWITCH', () => {
    detector.start();
    (document as any).visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));

    expect(signals.length).toBe(1);
    expect(signals[0].type).toBe('TAB_SWITCH');
    expect(signals[0].sessionId).toBe('test-session-123');
  });

  it('Test 4 - Return: visible does not trigger additional signal', () => {
    detector.start();
    (document as any).visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    
    (document as any).visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));

    expect(signals.length).toBe(1);
  });

  it('Test 5 - Window blur: dispatches WINDOW_BLUR', () => {
    detector.start();
    window.dispatchEvent(new Event('blur'));

    expect(signals.length).toBe(1);
    expect(signals[0].type).toBe('WINDOW_BLUR');
  });

  it('Test 6 - Focus: dispatches no additional signal', () => {
    detector.start();
    window.dispatchEvent(new Event('blur'));
    window.dispatchEvent(new Event('focus'));

    expect(signals.length).toBe(1);
  });

  it('Test 7 - Fullscreen exit: dispatches only when active', () => {
    detector.start();
    // Simulate exit
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true
    });
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(signals.length).toBe(1);
    expect(signals[0].type).toBe('FULLSCREEN_EXIT');
  });

  it('Test 8 - Startup fullscreen transition: ignored since start() occurs AFTER fullscreen', () => {
    // Before start(), no events fired
    Object.defineProperty(document, 'fullscreenElement', { value: document.createElement('div'), configurable: true });
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(signals.length).toBe(0);

    detector.start();
    expect(signals.length).toBe(0);
  });

  it('Test 9 - Navigation: dispatches NAVIGATION_ATTEMPT', () => {
    detector.start();
    window.dispatchEvent(new Event('popstate'));
    expect(signals.length).toBe(1);
    expect(signals[0].type).toBe('NAVIGATION_ATTEMPT');
  });

  it('Test 10 - Deduplication: suppress WINDOW_BLUR right after TAB_SWITCH', () => {
    detector.start();
    (document as any).visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('blur')); // Should be suppressed

    expect(signals.length).toBe(1);
    expect(signals[0].type).toBe('TAB_SWITCH');
  });

  it('Test 11 - Separate events: respects deduplication window', async () => {
    detector = createIntegrityDetector({
      sessionId: 'test-session-123',
      onSignal: (s) => signals.push(s),
      deduplicationWindowMs: 50 // Short window for test
    });
    detector.start();

    (document as any).visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));

    await new Promise(r => setTimeout(r, 60));

    window.dispatchEvent(new Event('blur'));

    expect(signals.length).toBe(2);
    expect(signals[0].type).toBe('TAB_SWITCH');
    expect(signals[1].type).toBe('WINDOW_BLUR');
  });

  it('Test 12 - Stop: removes listeners', () => {
    detector.start();
    detector.stop();

    (document as any).visibilityState = 'hidden';
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('blur'));

    expect(signals.length).toBe(0);
  });

  it('Test 13 - Double start: no duplicate listeners', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    detector.start();
    detector.start();
    
    // Each event type should only be registered once on the document
    const visibilityCalls = addEventListenerSpy.mock.calls.filter(c => c[0] === 'visibilitychange');
    expect(visibilityCalls.length).toBe(1);
  });

  it('Test 14 - Double stop: no errors', () => {
    detector.start();
    expect(() => {
      detector.stop();
      detector.stop();
    }).not.toThrow();
  });

});
