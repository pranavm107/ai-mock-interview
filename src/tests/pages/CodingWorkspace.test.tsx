/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CodingWorkspace from '../../pages/CodingWorkspace';
import * as integrityApiService from '../../services/coding/integrityApiService';
import * as clerkReact from '@clerk/clerk-react';
import * as codingFrontendService from '../../services/codingFrontendService';

// Mock dependencies
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock('@monaco-editor/react', () => {
  return {
    default: function DummyEditor() {
      return <div data-testid="editor" />;
    }
  };
});

vi.mock('../../services/coding/integrityApiService', () => ({
  createServerIntegritySession: vi.fn(),
  getServerIntegritySession: vi.fn(),
  processServerIntegritySignal: vi.fn(),
  endServerIntegritySession: vi.fn(),
  heartbeatServerIntegritySession: vi.fn(),
}));

vi.mock('../../services/codingFrontendService', () => ({
  codingFrontendService: {
    getProblemBySlug: vi.fn(),
    executeCode: vi.fn(),
    runTests: vi.fn(),
    submitCode: vi.fn(),
  }
}));

describe('CodingWorkspace - C16 Heartbeat Lifecycle', () => {
  const mockGetToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (clerkReact.useAuth as any).mockReturnValue({
      getToken: mockGetToken,
    });

    mockGetToken.mockResolvedValue('fake-token');

    (codingFrontendService.codingFrontendService.getProblemBySlug as any).mockResolvedValue({
      id: 'p1',
      title: 'Valid Anagram',
      difficulty: 'EASY',
      description: 'Test description',
      examples: [],
      constraints: []
    });

    // Mock document fullscreen API to allow integrity session to start
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, writable: true });
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Element.prototype.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mock localStorage
    const localStorageMock = (function () {
      let store: Record<string, string> = {};
      return {
        getItem(key: string) {
          return store[key] || null;
        },
        setItem(key: string, value: string) {
          store[key] = value;
        },
        clear() {
          store = {};
        },
        removeItem(key: string) {
          delete store[key];
        },
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('starts heartbeat only when session is ACTIVE and cleans up on unmount', async () => {
    (integrityApiService.createServerIntegritySession as any).mockResolvedValue({
      sessionId: 'session-123',
      status: 'ACTIVE',
      strikeCount: 0,
      maxStrikes: 3
    });

    (integrityApiService.heartbeatServerIntegritySession as any).mockResolvedValue({
      sessionId: 'session-123',
      status: 'ACTIVE',
      strikeCount: 0,
      maxStrikes: 3,
      lastHeartbeatAt: new Date().toISOString(),
      isStale: false
    });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/coding/problem/valid-anagram']}>
        <Routes>
          <Route path="/coding/problem/:slug" element={<CodingWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for problem to load
    const titleElements = await screen.findAllByText('Valid Anagram');
    expect(titleElements.length).toBeGreaterThan(0);

    vi.useFakeTimers({ toFake: ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout'] });

    // Ensure no heartbeat yet
    expect(integrityApiService.heartbeatServerIntegritySession).not.toHaveBeenCalled();

    // Start integrity session
    const startBtn = screen.getByText(/Integrity Mode/i);
    act(() => {
      startBtn.click();
    });

    const checkbox = screen.getByRole('checkbox');
    act(() => {
      checkbox.click();
    });

    const confirmBtn = screen.getByText(/Start Session/i);
    await act(async () => {
      confirmBtn.click();
    });

    // Verify session started
    expect(integrityApiService.createServerIntegritySession).toHaveBeenCalled();

    // Advance 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledTimes(1);
    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledWith('session-123', 'fake-token');

    // Advance another 30s
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledTimes(2);

    // Unmount
    unmount();

    // Advance 30s after unmount
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should not have been called a third time
    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledTimes(2);
  });

  it('prevents overlapping heartbeat requests', async () => {
    (integrityApiService.createServerIntegritySession as any).mockResolvedValue({
      sessionId: 'session-123',
      status: 'ACTIVE',
      strikeCount: 0,
      maxStrikes: 3
    });

    let resolveHeartbeat: (val: any) => void = () => {};
    const heartbeatPromise = new Promise(resolve => {
      resolveHeartbeat = resolve;
    });

    (integrityApiService.heartbeatServerIntegritySession as any).mockReturnValue(heartbeatPromise);

    render(
      <MemoryRouter initialEntries={['/coding/problem/valid-anagram']}>
        <Routes>
          <Route path="/coding/problem/:slug" element={<CodingWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    const titleElements = await screen.findAllByText('Valid Anagram');
    expect(titleElements.length).toBeGreaterThan(0);

    vi.useFakeTimers({ toFake: ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout'] });

    // Start session
    act(() => screen.getByText(/Integrity Mode/i).click());
    act(() => screen.getByRole('checkbox').click());
    await act(async () => screen.getByText(/Start Session/i).click());

    // Trigger first heartbeat
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledTimes(1);

    // Trigger second heartbeat while first is pending
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // Should still only be 1 because isHeartbeating lock is true
    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledTimes(1);

    // Resolve first heartbeat
    await act(async () => {
      resolveHeartbeat({
        sessionId: 'session-123',
        status: 'ACTIVE',
        strikeCount: 0,
        maxStrikes: 3
      });
    });

    // Trigger third heartbeat (now unlocked)
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledTimes(2);
  });

  it('ignores network errors silently without crashing', async () => {
    (integrityApiService.createServerIntegritySession as any).mockResolvedValue({
      sessionId: 'session-123',
      status: 'ACTIVE',
      strikeCount: 0,
      maxStrikes: 3
    });

    (integrityApiService.heartbeatServerIntegritySession as any).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/coding/problem/valid-anagram']}>
        <Routes>
          <Route path="/coding/problem/:slug" element={<CodingWorkspace />} />
        </Routes>
      </MemoryRouter>
    );

    const titleElements = await screen.findAllByText('Valid Anagram');
    expect(titleElements.length).toBeGreaterThan(0);

    vi.useFakeTimers({ toFake: ['setInterval', 'setTimeout', 'clearInterval', 'clearTimeout'] });

    // Start session
    act(() => screen.getByText(/Integrity Mode/i).click());
    act(() => screen.getByRole('checkbox').click());
    await act(async () => screen.getByText(/Start Session/i).click());

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Trigger heartbeat which fails
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(consoleSpy).toHaveBeenCalledWith('Heartbeat failed', expect.any(Error));
    
    // UI should still be active, lock should be released
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(integrityApiService.heartbeatServerIntegritySession).toHaveBeenCalledTimes(2);
    
    consoleSpy.mockRestore();
  });
});
