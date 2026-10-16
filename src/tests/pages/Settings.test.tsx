// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Settings from '../../pages/Settings';
import * as settingsHook from '../../hooks/useSettings';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      fullName: 'Test User',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
      imageUrl: null,
      firstName: 'Test'
    }
  }),
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('mock-token')
  })
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockBlockerCallback: any = null;
const mockBlocker = {
  state: 'unblocked',
  reset: vi.fn(),
  proceed: vi.fn(),
  location: undefined
};

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useBlocker: (cb: any) => {
    mockBlockerCallback = cb;
    return mockBlocker;
  },
  Link: ({ to, children }: any) => <a href={to}>{children}</a>
}));

describe('Settings Navigation Blocking', () => {
  const mockSaveChanges = vi.fn();
  const mockDiscardChanges = vi.fn();
  const mockRefetch = vi.fn();
  const mockUpdateInterview = vi.fn();

  const defaultHookReturn: settingsHook.UseSettingsReturn = {
    settings: {
      userId: 'user_123',
      interview: {
        defaultDifficulty: 'Medium',
        defaultInterviewType: 'Mixed',
        speechPace: 'normal',
        autoPlayAudio: true
      },
      coding: {
        defaultLanguage: 'python',
        editorFontSize: 14,
        tabSize: 2,
        enableIntegrityModeByDefault: true
      },
      notifications: {
        practiceReminders: true,
        weeklyDigest: true,
        achievementAlerts: true
      },
      appearance: {
        theme: 'system'
      },
      privacy: {
        showActivityOnLeaderboard: false,
        allowDataTelemetry: false
      }
    },
    loading: false,
    saving: false,
    error: null,
    successMessage: null,
    isDirty: false,
    updateInterview: mockUpdateInterview,
    updateCoding: vi.fn(),
    updateNotifications: vi.fn(),
    updateAppearance: vi.fn(),
    updatePrivacy: vi.fn(),
    saveChanges: mockSaveChanges,
    discardChanges: mockDiscardChanges,
    refetch: mockRefetch
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBlocker.state = 'unblocked';
    vi.spyOn(settingsHook, 'useSettings').mockReturnValue(defaultHookReturn);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('does not block navigation when isDirty is false', () => {
    render(<Settings />);

    expect(mockBlockerCallback).toBeDefined();
    const shouldBlock = mockBlockerCallback({
      currentLocation: { pathname: '/settings' },
      nextLocation: { pathname: '/dashboard' }
    });
    expect(shouldBlock).toBe(false);
  });

  it('blocks navigation to different pathname when isDirty is true', () => {
    vi.spyOn(settingsHook, 'useSettings').mockReturnValue({
      ...defaultHookReturn,
      isDirty: true
    });

    render(<Settings />);

    // Navigating away from /settings
    const shouldBlockAway = mockBlockerCallback({
      currentLocation: { pathname: '/settings' },
      nextLocation: { pathname: '/dashboard' }
    });
    expect(shouldBlockAway).toBe(true);

    // Navigating to the same pathname should not block
    const shouldBlockSame = mockBlockerCallback({
      currentLocation: { pathname: '/settings' },
      nextLocation: { pathname: '/settings' }
    });
    expect(shouldBlockSame).toBe(false);
  });

  it('renders confirmation dialog when blocker state is blocked', () => {
    mockBlocker.state = 'blocked';
    vi.spyOn(settingsHook, 'useSettings').mockReturnValue({
      ...defaultHookReturn,
      isDirty: true
    });

    render(<Settings />);

    expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
    expect(screen.getByText('Stay on Page')).toBeInTheDocument();
    expect(screen.getByText('Discard & Leave')).toBeInTheDocument();
    expect(screen.getByText('Save & Leave')).toBeInTheDocument();
  });

  it('handles Stay on Page action by resetting blocker', () => {
    mockBlocker.state = 'blocked';
    vi.spyOn(settingsHook, 'useSettings').mockReturnValue({
      ...defaultHookReturn,
      isDirty: true
    });

    render(<Settings />);

    fireEvent.click(screen.getByText('Stay on Page'));
    expect(mockBlocker.reset).toHaveBeenCalledTimes(1);
    expect(mockBlocker.proceed).not.toHaveBeenCalled();
    expect(mockDiscardChanges).not.toHaveBeenCalled();
  });

  it('handles Discard & Leave action by discarding changes and proceeding', () => {
    mockBlocker.state = 'blocked';
    vi.spyOn(settingsHook, 'useSettings').mockReturnValue({
      ...defaultHookReturn,
      isDirty: true
    });

    render(<Settings />);

    fireEvent.click(screen.getByText('Discard & Leave'));
    expect(mockDiscardChanges).toHaveBeenCalledTimes(1);
    expect(mockBlocker.proceed).toHaveBeenCalledTimes(1);
  });

  it('handles Save & Leave action by saving and proceeding on success', async () => {
    mockBlocker.state = 'blocked';
    mockSaveChanges.mockResolvedValue(true);
    vi.spyOn(settingsHook, 'useSettings').mockReturnValue({
      ...defaultHookReturn,
      isDirty: true
    });

    render(<Settings />);

    fireEvent.click(screen.getByText('Save & Leave'));

    await waitFor(() => {
      expect(mockSaveChanges).toHaveBeenCalledTimes(1);
      expect(mockBlocker.proceed).toHaveBeenCalledTimes(1);
    });
  });

  it('does not proceed on Save & Leave if save fails', async () => {
    mockBlocker.state = 'blocked';
    mockSaveChanges.mockResolvedValue(false);
    vi.spyOn(settingsHook, 'useSettings').mockReturnValue({
      ...defaultHookReturn,
      isDirty: true
    });

    render(<Settings />);

    fireEvent.click(screen.getByText('Save & Leave'));

    await waitFor(() => {
      expect(mockSaveChanges).toHaveBeenCalledTimes(1);
      expect(mockBlocker.proceed).not.toHaveBeenCalled();
    });
  });
});
