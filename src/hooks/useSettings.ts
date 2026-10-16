import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchUserSettings, updateUserSettings } from '../services/settingsService';
import type {
  UserSettings,
  InterviewPreferences,
  CodingPreferences,
  NotificationPreferences,
  AppearancePreferences,
  PrivacyPreferences
} from '../types/settings';

export interface UseSettingsReturn {
  settings: UserSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  isDirty: boolean;
  updateInterview: <K extends keyof InterviewPreferences>(key: K, value: InterviewPreferences[K]) => void;
  updateCoding: <K extends keyof CodingPreferences>(key: K, value: CodingPreferences[K]) => void;
  updateNotifications: <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => void;
  updateAppearance: <K extends keyof AppearancePreferences>(key: K, value: AppearancePreferences[K]) => void;
  updatePrivacy: <K extends keyof PrivacyPreferences>(key: K, value: PrivacyPreferences[K]) => void;
  saveChanges: () => Promise<boolean>;
  discardChanges: () => void;
  refetch: () => Promise<void>;
}

export const applyTheme = (theme: 'system' | 'light' | 'dark') => {
  if (typeof window === 'undefined') return;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  try {
    localStorage.setItem('preppilot-theme', theme);
  } catch {
    // ignore
  }
};

export const useSettings = (): UseSettingsReturn => {
  const { getToken } = useAuth();
  const [originalSettings, setOriginalSettings] = useState<UserSettings | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSettings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const data = await fetchUserSettings(token, signal);
      if (!signal?.aborted) {
        setOriginalSettings(data);
        setSettings(data);
        if (data.appearance?.theme) {
          applyTheme(data.appearance.theme);
        }
      }
    } catch (err: any) {
      if (!signal?.aborted) {
        console.error('[useSettings] Failed to load settings:', err);
        setError(err.message || 'Failed to load preferences');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [getToken]);

  useEffect(() => {
    const controller = new AbortController();
    loadSettings(controller.signal);
    return () => controller.abort();
  }, [loadSettings]);

  // Sync theme changes to DOM and system color scheme listener
  useEffect(() => {
    if (settings?.appearance?.theme) {
      applyTheme(settings.appearance.theme);

      if (settings.appearance.theme === 'system' && typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, [settings?.appearance?.theme]);

  const isDirty = useMemo(() => {
    if (!settings || !originalSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  // Warn on page reload or closing tab when unsaved changes exist
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const updateInterview = useCallback(<K extends keyof InterviewPreferences>(key: K, value: InterviewPreferences[K]) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        interview: {
          ...prev.interview,
          [key]: value
        }
      };
    });
  }, []);

  const updateCoding = useCallback(<K extends keyof CodingPreferences>(key: K, value: CodingPreferences[K]) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        coding: {
          ...prev.coding,
          [key]: value
        }
      };
    });
  }, []);

  const updateNotifications = useCallback(<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: value
        }
      };
    });
  }, []);

  const updateAppearance = useCallback(<K extends keyof AppearancePreferences>(key: K, value: AppearancePreferences[K]) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          [key]: value
        }
      };
    });
  }, []);

  const updatePrivacy = useCallback(<K extends keyof PrivacyPreferences>(key: K, value: PrivacyPreferences[K]) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        privacy: {
          ...prev.privacy,
          [key]: value
        }
      };
    });
  }, []);

  const discardChanges = useCallback(() => {
    if (originalSettings) {
      setSettings(originalSettings);
      setError(null);
    }
  }, [originalSettings]);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!settings) return false;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const updated = await updateUserSettings(token, {
        interview: settings.interview,
        coding: settings.coding,
        notifications: settings.notifications,
        appearance: settings.appearance,
        privacy: settings.privacy
      });

      setOriginalSettings(updated);
      setSettings(updated);
      setSuccessMessage('Your preferences have been saved successfully.');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);

      return true;
    } catch (err: any) {
      console.error('[useSettings] Failed to save settings:', err);
      setError(err.message || 'Failed to save preferences');
      return false;
    } finally {
      setSaving(false);
    }
  }, [getToken, settings]);

  const refetch = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    successMessage,
    isDirty,
    updateInterview,
    updateCoding,
    updateNotifications,
    updateAppearance,
    updatePrivacy,
    saveChanges,
    discardChanges,
    refetch
  };
};
