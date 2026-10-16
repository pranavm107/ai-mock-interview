import { db } from '../config/firebaseAdmin';
import {
  UserSettings,
  UserSettingsUpdate,
  InterviewDifficulty,
  InterviewTypePreference,
  SpeechPacePreference,
  CodingLanguagePreference,
  ThemePreference,
  InterviewPreferences,
  CodingPreferences,
  NotificationPreferences,
  AppearancePreferences,
  PrivacyPreferences
} from '../types/settings';

const VALID_DIFFICULTIES: Set<InterviewDifficulty> = new Set(['Beginner', 'Medium', 'Hard']);
const VALID_INTERVIEW_TYPES: Set<InterviewTypePreference> = new Set(['Technical', 'Behavioral', 'Mixed']);
const VALID_SPEECH_PACES: Set<SpeechPacePreference> = new Set(['slow', 'normal', 'fast']);
const VALID_LANGUAGES: Set<CodingLanguagePreference> = new Set([
  'python',
  'javascript',
  'typescript',
  'cpp',
  'java',
  'go',
  'rust',
  'csharp'
]);
const VALID_THEMES: Set<ThemePreference> = new Set(['system', 'light', 'dark']);

const ALLOWED_TOP_LEVEL_SECTIONS = new Set([
  'interview',
  'coding',
  'notifications',
  'appearance',
  'privacy'
]);

const ALLOWED_INTERVIEW_KEYS = new Set([
  'defaultDifficulty',
  'defaultInterviewType',
  'autoPlayAudio',
  'speechPace'
]);

const ALLOWED_CODING_KEYS = new Set([
  'defaultLanguage',
  'editorFontSize',
  'tabSize',
  'enableIntegrityModeByDefault'
]);

const ALLOWED_NOTIFICATION_KEYS = new Set([
  'practiceReminders',
  'weeklyDigest',
  'achievementAlerts'
]);

const ALLOWED_APPEARANCE_KEYS = new Set(['theme']);

const ALLOWED_PRIVACY_KEYS = new Set([
  'showActivityOnLeaderboard',
  'allowDataTelemetry'
]);

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId'> = {
  interview: {
    defaultDifficulty: 'Medium',
    defaultInterviewType: 'Technical',
    autoPlayAudio: true,
    speechPace: 'normal'
  },
  coding: {
    defaultLanguage: 'python',
    editorFontSize: 14,
    tabSize: 2,
    enableIntegrityModeByDefault: false
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
    showActivityOnLeaderboard: true,
    allowDataTelemetry: true
  }
};

export class SettingsService {
  private collection = db.collection('userSettings');

  public async getUserSettings(userId: string): Promise<UserSettings> {
    const docRef = this.collection.doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return {
        userId,
        ...DEFAULT_USER_SETTINGS
      };
    }

    const data = docSnap.data() || {};
    return {
      userId,
      interview: {
        ...DEFAULT_USER_SETTINGS.interview,
        ...(data.interview || {})
      },
      coding: {
        ...DEFAULT_USER_SETTINGS.coding,
        ...(data.coding || {})
      },
      notifications: {
        ...DEFAULT_USER_SETTINGS.notifications,
        ...(data.notifications || {})
      },
      appearance: {
        ...DEFAULT_USER_SETTINGS.appearance,
        ...(data.appearance || {})
      },
      privacy: {
        ...DEFAULT_USER_SETTINGS.privacy,
        ...(data.privacy || {})
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  public validateUpdates(updates: any): void {
    if (typeof updates !== 'object' || updates === null || Array.isArray(updates)) {
      throw new Error('Invalid settings payload: body must be a JSON object');
    }

    const topLevelKeys = Object.keys(updates);
    if (topLevelKeys.length === 0) {
      throw new Error('Invalid settings payload: update body cannot be empty');
    }

    // Strict allowlist for top-level keys
    for (const key of topLevelKeys) {
      if (!ALLOWED_TOP_LEVEL_SECTIONS.has(key)) {
        throw new Error(`Invalid settings payload: unrecognized section '${key}'`);
      }
    }

    // 1. Interview section validation
    if (updates.interview !== undefined) {
      if (typeof updates.interview !== 'object' || updates.interview === null || Array.isArray(updates.interview)) {
        throw new Error("Invalid 'interview' settings: must be an object");
      }
      for (const key of Object.keys(updates.interview)) {
        if (!ALLOWED_INTERVIEW_KEYS.has(key)) {
          throw new Error(`Invalid interview setting: unrecognized key '${key}'`);
        }
      }
      const { defaultDifficulty, defaultInterviewType, autoPlayAudio, speechPace } = updates.interview;
      if (defaultDifficulty !== undefined && !VALID_DIFFICULTIES.has(defaultDifficulty)) {
        throw new Error(`Invalid interview difficulty: must be one of ${Array.from(VALID_DIFFICULTIES).join(', ')}`);
      }
      if (defaultInterviewType !== undefined && !VALID_INTERVIEW_TYPES.has(defaultInterviewType)) {
        throw new Error(`Invalid interview type: must be one of ${Array.from(VALID_INTERVIEW_TYPES).join(', ')}`);
      }
      if (autoPlayAudio !== undefined && typeof autoPlayAudio !== 'boolean') {
        throw new Error("Invalid autoPlayAudio: must be a boolean");
      }
      if (speechPace !== undefined && !VALID_SPEECH_PACES.has(speechPace)) {
        throw new Error(`Invalid speech pace: must be one of ${Array.from(VALID_SPEECH_PACES).join(', ')}`);
      }
    }

    // 2. Coding section validation
    if (updates.coding !== undefined) {
      if (typeof updates.coding !== 'object' || updates.coding === null || Array.isArray(updates.coding)) {
        throw new Error("Invalid 'coding' settings: must be an object");
      }
      for (const key of Object.keys(updates.coding)) {
        if (!ALLOWED_CODING_KEYS.has(key)) {
          throw new Error(`Invalid coding setting: unrecognized key '${key}'`);
        }
      }
      const { defaultLanguage, editorFontSize, tabSize, enableIntegrityModeByDefault } = updates.coding;
      if (defaultLanguage !== undefined && !VALID_LANGUAGES.has(defaultLanguage)) {
        throw new Error(`Invalid coding language: must be one of ${Array.from(VALID_LANGUAGES).join(', ')}`);
      }
      if (editorFontSize !== undefined) {
        if (typeof editorFontSize !== 'number' || !Number.isInteger(editorFontSize) || editorFontSize < 10 || editorFontSize > 32) {
          throw new Error('Invalid editorFontSize: must be an integer between 10 and 32');
        }
      }
      if (tabSize !== undefined) {
        if (tabSize !== 2 && tabSize !== 4) {
          throw new Error('Invalid tabSize: must be either 2 or 4');
        }
      }
      if (enableIntegrityModeByDefault !== undefined && typeof enableIntegrityModeByDefault !== 'boolean') {
        throw new Error('Invalid enableIntegrityModeByDefault: must be a boolean');
      }
    }

    // 3. Notifications section validation
    if (updates.notifications !== undefined) {
      if (typeof updates.notifications !== 'object' || updates.notifications === null || Array.isArray(updates.notifications)) {
        throw new Error("Invalid 'notifications' settings: must be an object");
      }
      for (const key of Object.keys(updates.notifications)) {
        if (!ALLOWED_NOTIFICATION_KEYS.has(key)) {
          throw new Error(`Invalid notification setting: unrecognized key '${key}'`);
        }
      }
      const { practiceReminders, weeklyDigest, achievementAlerts } = updates.notifications;
      if (practiceReminders !== undefined && typeof practiceReminders !== 'boolean') {
        throw new Error('Invalid practiceReminders: must be a boolean');
      }
      if (weeklyDigest !== undefined && typeof weeklyDigest !== 'boolean') {
        throw new Error('Invalid weeklyDigest: must be a boolean');
      }
      if (achievementAlerts !== undefined && typeof achievementAlerts !== 'boolean') {
        throw new Error('Invalid achievementAlerts: must be a boolean');
      }
    }

    // 4. Appearance section validation
    if (updates.appearance !== undefined) {
      if (typeof updates.appearance !== 'object' || updates.appearance === null || Array.isArray(updates.appearance)) {
        throw new Error("Invalid 'appearance' settings: must be an object");
      }
      for (const key of Object.keys(updates.appearance)) {
        if (!ALLOWED_APPEARANCE_KEYS.has(key)) {
          throw new Error(`Invalid appearance setting: unrecognized key '${key}'`);
        }
      }
      const { theme } = updates.appearance;
      if (theme !== undefined && !VALID_THEMES.has(theme)) {
        throw new Error(`Invalid theme: must be one of ${Array.from(VALID_THEMES).join(', ')}`);
      }
    }

    // 5. Privacy section validation
    if (updates.privacy !== undefined) {
      if (typeof updates.privacy !== 'object' || updates.privacy === null || Array.isArray(updates.privacy)) {
        throw new Error("Invalid 'privacy' settings: must be an object");
      }
      for (const key of Object.keys(updates.privacy)) {
        if (!ALLOWED_PRIVACY_KEYS.has(key)) {
          throw new Error(`Invalid privacy setting: unrecognized key '${key}'`);
        }
      }
      const { showActivityOnLeaderboard, allowDataTelemetry } = updates.privacy;
      if (showActivityOnLeaderboard !== undefined && typeof showActivityOnLeaderboard !== 'boolean') {
        throw new Error('Invalid showActivityOnLeaderboard: must be a boolean');
      }
      if (allowDataTelemetry !== undefined && typeof allowDataTelemetry !== 'boolean') {
        throw new Error('Invalid allowDataTelemetry: must be a boolean');
      }
    }
  }

  public async updateUserSettings(userId: string, updates: UserSettingsUpdate): Promise<UserSettings> {
    this.validateUpdates(updates);

    const docRef = this.collection.doc(userId);
    const now = new Date().toISOString();

    let savedSettings: UserSettings | null = null;

    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);
      const existing = docSnap.exists ? docSnap.data() : null;

      // Deep merge section by section to guarantee sibling fields are never overwritten
      const interview: InterviewPreferences = {
        ...(existing?.interview || DEFAULT_USER_SETTINGS.interview),
        ...(updates.interview
          ? {
              ...(updates.interview.defaultDifficulty !== undefined && { defaultDifficulty: updates.interview.defaultDifficulty }),
              ...(updates.interview.defaultInterviewType !== undefined && { defaultInterviewType: updates.interview.defaultInterviewType }),
              ...(updates.interview.autoPlayAudio !== undefined && { autoPlayAudio: updates.interview.autoPlayAudio }),
              ...(updates.interview.speechPace !== undefined && { speechPace: updates.interview.speechPace })
            }
          : {})
      };

      const coding: CodingPreferences = {
        ...(existing?.coding || DEFAULT_USER_SETTINGS.coding),
        ...(updates.coding
          ? {
              ...(updates.coding.defaultLanguage !== undefined && { defaultLanguage: updates.coding.defaultLanguage }),
              ...(updates.coding.editorFontSize !== undefined && { editorFontSize: updates.coding.editorFontSize }),
              ...(updates.coding.tabSize !== undefined && { tabSize: updates.coding.tabSize }),
              ...(updates.coding.enableIntegrityModeByDefault !== undefined && { enableIntegrityModeByDefault: updates.coding.enableIntegrityModeByDefault })
            }
          : {})
      };

      const notifications: NotificationPreferences = {
        ...(existing?.notifications || DEFAULT_USER_SETTINGS.notifications),
        ...(updates.notifications
          ? {
              ...(updates.notifications.practiceReminders !== undefined && { practiceReminders: updates.notifications.practiceReminders }),
              ...(updates.notifications.weeklyDigest !== undefined && { weeklyDigest: updates.notifications.weeklyDigest }),
              ...(updates.notifications.achievementAlerts !== undefined && { achievementAlerts: updates.notifications.achievementAlerts })
            }
          : {})
      };

      const appearance: AppearancePreferences = {
        ...(existing?.appearance || DEFAULT_USER_SETTINGS.appearance),
        ...(updates.appearance
          ? {
              ...(updates.appearance.theme !== undefined && { theme: updates.appearance.theme })
            }
          : {})
      };

      const privacy: PrivacyPreferences = {
        ...(existing?.privacy || DEFAULT_USER_SETTINGS.privacy),
        ...(updates.privacy
          ? {
              ...(updates.privacy.showActivityOnLeaderboard !== undefined && { showActivityOnLeaderboard: updates.privacy.showActivityOnLeaderboard }),
              ...(updates.privacy.allowDataTelemetry !== undefined && { allowDataTelemetry: updates.privacy.allowDataTelemetry })
            }
          : {})
      };

      const cleanPayload: Record<string, any> = {
        userId,
        interview,
        coding,
        notifications,
        appearance,
        privacy,
        updatedAt: now,
        createdAt: existing?.createdAt || now
      };

      transaction.set(docRef, cleanPayload);

      savedSettings = {
        userId,
        interview,
        coding,
        notifications,
        appearance,
        privacy,
        createdAt: cleanPayload.createdAt,
        updatedAt: now
      };
    });

    if (!savedSettings) {
      throw new Error('Failed to persist user settings');
    }

    return savedSettings;
  }
}

export const settingsService = new SettingsService();
