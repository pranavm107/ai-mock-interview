export type InterviewDifficulty = 'Beginner' | 'Medium' | 'Hard';
export type InterviewTypePreference = 'Technical' | 'Behavioral' | 'Mixed';
export type SpeechPacePreference = 'slow' | 'normal' | 'fast';

export type CodingLanguagePreference =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'cpp'
  | 'java'
  | 'go'
  | 'rust'
  | 'csharp';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface InterviewPreferences {
  defaultDifficulty: InterviewDifficulty;
  defaultInterviewType: InterviewTypePreference;
  autoPlayAudio: boolean;
  speechPace: SpeechPacePreference;
}

export interface CodingPreferences {
  defaultLanguage: CodingLanguagePreference;
  editorFontSize: number;
  tabSize: number;
  enableIntegrityModeByDefault: boolean;
}

export interface NotificationPreferences {
  practiceReminders: boolean;
  weeklyDigest: boolean;
  achievementAlerts: boolean;
}

export interface AppearancePreferences {
  theme: ThemePreference;
}

export interface PrivacyPreferences {
  showActivityOnLeaderboard: boolean;
  allowDataTelemetry: boolean;
}

export interface UserSettings {
  userId: string;
  interview: InterviewPreferences;
  coding: CodingPreferences;
  notifications: NotificationPreferences;
  appearance: AppearancePreferences;
  privacy: PrivacyPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export type UserSettingsUpdate = {
  interview?: Partial<InterviewPreferences>;
  coding?: Partial<CodingPreferences>;
  notifications?: Partial<NotificationPreferences>;
  appearance?: Partial<AppearancePreferences>;
  privacy?: Partial<PrivacyPreferences>;
};
