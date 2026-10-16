import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useBlocker } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Mic,
  Code2,
  Bell,
  Palette,
  Shield,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  Volume2
} from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { useSettings } from '../hooks/useSettings';
import type {
  InterviewDifficulty,
  InterviewTypePreference,
  SpeechPacePreference,
  CodingLanguagePreference,
  ThemePreference
} from '../types/settings';

type SettingsTab = 'interview' | 'coding' | 'notifications' | 'appearance' | 'account';

const LANGUAGE_LABELS: Record<CodingLanguagePreference, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  cpp: 'C++',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
  csharp: 'C#'
};

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('interview');

  const {
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
  } = useSettings();

  // Block internal React Router navigation if settings are dirty
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  );

  const handleCancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  const handleDiscardAndLeave = useCallback(() => {
    discardChanges();
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [discardChanges, blocker]);

  const handleSaveAndLeave = useCallback(async () => {
    const success = await saveChanges();
    if (success && blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [saveChanges, blocker]);

  if (loading) {
    return (
      <div className="pb-16 max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-pulse">
        <AppBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings' }]} />
        <PageHeader
          title="Settings & Preferences"
          description="Loading your personalized platform preferences..."
          icon={SettingsIcon}
        />
        <div className="h-12 bg-slate-200 rounded-xl w-full max-w-md"></div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="pb-16 max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <AppBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings' }]} />
        <PageHeader
          title="Settings & Preferences"
          description="Manage your account preferences, mock interview defaults, and workspace setup."
          icon={SettingsIcon}
        />
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">Failed to load settings</h3>
          <p className="text-sm text-slate-600 mb-5 max-w-md">{error || 'An unexpected error occurred while fetching your preferences.'}</p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl gap-2">
            <RotateCcw size={16} />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <AppBreadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Settings' }]} />

      <PageHeader
        title="Settings & Preferences"
        description="Customize your AI mock interviews, coding workspace configurations, notification rules, and privacy."
        icon={SettingsIcon}
      />

      {/* Global Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium shadow-xs"
            role="alert"
          >
            <Check size={18} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium shadow-xs"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs underline hover:no-underline font-semibold"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl overflow-x-auto scrollbar-none border border-slate-200/70">
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'interview'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Mic size={16} />
          Interview
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'coding'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Code2 size={16} />
          Coding Workspace
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'notifications'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Bell size={16} />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'appearance'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Palette size={16} />
          Appearance & Privacy
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'account'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Shield size={16} />
          Account & Security
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* INTERVIEW TAB */}
        {activeTab === 'interview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-slate-200/90 space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mic size={18} className="text-blue-600" />
                Mock Interview Experience
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Configure default simulation difficulty, interview structure, and AI voice responses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Default Difficulty */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Default Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Medium', 'Hard'] as InterviewDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => updateInterview('defaultDifficulty', diff)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        settings.interview.defaultDifficulty === diff
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Determines question complexity and follow-up depth in generated sessions.
                </p>
              </div>

              {/* Default Interview Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Default Interview Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Technical', 'Behavioral', 'Mixed'] as InterviewTypePreference[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateInterview('defaultInterviewType', t)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        settings.interview.defaultInterviewType === t
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Pre-selects question focus when initiating an interview from the dashboard.
                </p>
              </div>

              {/* AI Voice Pace */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Interviewer Speech Pace
                  </label>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Upcoming Feature
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['slow', 'normal', 'fast'] as SpeechPacePreference[]).map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => updateInterview('speechPace', pace)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        settings.interview.speechPace === pace
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  PrepPilot currently utilizes real-time streaming WebSocket audio. Configurable playback rates are planned for an upcoming audio update.
                </p>
              </div>

              {/* Audio Autoplay Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-900">
                      <Volume2 size={16} className="text-blue-600" />
                      Auto-Play Question Audio
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Upcoming Feature
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Live interview questions are handled via duplex socket streams; custom autoplay controls are planned for an upcoming release.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.interview.autoPlayAudio}
                  onClick={() => updateInterview('autoPlayAudio', !settings.interview.autoPlayAudio)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.interview.autoPlayAudio ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.interview.autoPlayAudio ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* CODING TAB */}
        {activeTab === 'coding' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-slate-200/90 space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code2 size={18} className="text-blue-600" />
                Coding Workspace Defaults
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Set your primary programming language, editor layout, and test integrity options.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Default Language */}
              <div className="space-y-2">
                <label htmlFor="select-default-language" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Preferred Programming Language
                </label>
                <select
                  id="select-default-language"
                  value={settings.coding.defaultLanguage}
                  onChange={(e) => updateCoding('defaultLanguage', e.target.value as CodingLanguagePreference)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  {(Object.keys(LANGUAGE_LABELS) as CodingLanguagePreference[]).map((lang) => (
                    <option key={lang} value={lang}>
                      {LANGUAGE_LABELS[lang]}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Opens by default whenever you enter a new technical coding challenge.
                </p>
              </div>

              {/* Editor Font Size */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Editor Font Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[12, 14, 16, 18].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateCoding('editorFontSize', size)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        settings.coding.editorFontSize === size
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Controls Monaco editor typography scaling in coding challenges.
                </p>
              </div>

              {/* Tab Size */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tab Indentation Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[2, 4].map((tabs) => (
                    <button
                      key={tabs}
                      type="button"
                      onClick={() => updateCoding('tabSize', tabs)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        settings.coding.tabSize === tabs
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {tabs} Spaces
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Indentation level used for code auto-formatting and tab key strokes.
                </p>
              </div>

              {/* Integrity Mode Default Switch */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-900">
                    <Shield size={16} className="text-blue-600" />
                    Proctoring Mode by Default
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Require fullscreen lock and tab-switching monitoring during coding tests.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.coding.enableIntegrityModeByDefault}
                  onClick={() =>
                    updateCoding('enableIntegrityModeByDefault', !settings.coding.enableIntegrityModeByDefault)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.coding.enableIntegrityModeByDefault ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.coding.enableIntegrityModeByDefault ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-slate-200/90 space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell size={18} className="text-blue-600" />
                Notification & Communication Rules
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Control reminders, milestone unlock notifications, and readiness reporting.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Practice Reminders */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 block">
                      Daily Practice Reminders
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Email Delivery Planned
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Email notification delivery is currently in development. Your preference will be applied automatically once outgoing email service is deployed.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notifications.practiceReminders}
                  onClick={() => updateNotifications('practiceReminders', !settings.notifications.practiceReminders)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.notifications.practiceReminders ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.notifications.practiceReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Digest */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 block">
                      Weekly Readiness Digest
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Email Delivery Planned
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Automated weekly performance summary emails are scheduled for deployment with email infrastructure.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notifications.weeklyDigest}
                  onClick={() => updateNotifications('weeklyDigest', !settings.notifications.weeklyDigest)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.notifications.weeklyDigest ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.notifications.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Achievement Alerts */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 block">
                    Achievement & Badge Notifications
                  </span>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    In-app milestone unlock celebrations and badge award highlights.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notifications.achievementAlerts}
                  onClick={() => updateNotifications('achievementAlerts', !settings.notifications.achievementAlerts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    settings.notifications.achievementAlerts ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.notifications.achievementAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* APPEARANCE & PRIVACY TAB */}
        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-slate-200/90 space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette size={18} className="text-blue-600" />
                Appearance & Privacy Controls
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Customize your visual theme and configure activity privacy preferences.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              {/* Theme Preference */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Color Theme Preference
                </label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {(['system', 'light', 'dark'] as ThemePreference[]).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => updateAppearance('theme', theme)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        settings.appearance.theme === theme
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Select your interface color scheme (PrepPilot adapts to system appearance by default).
                </p>
              </div>

              {/* Privacy Toggles */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Privacy & Telemetry
                </h3>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="space-y-0.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 block">
                        Show Activity on Community Leaderboard
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Upcoming Feature
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Community leaderboards are scheduled for a future platform release. Your privacy preference is saved to your account profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.privacy.showActivityOnLeaderboard}
                    onClick={() =>
                      updatePrivacy('showActivityOnLeaderboard', !settings.privacy.showActivityOnLeaderboard)
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      settings.privacy.showActivityOnLeaderboard ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        settings.privacy.showActivityOnLeaderboard ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="space-y-0.5 pr-4">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 block">
                      Anonymous Diagnostics & Telemetry
                    </span>
                    <p className="text-[11px] text-slate-500">
                      PrepPilot operates without external ad trackers. This setting controls internal diagnostic evaluation telemetry.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.privacy.allowDataTelemetry}
                    onClick={() => updatePrivacy('allowDataTelemetry', !settings.privacy.allowDataTelemetry)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      settings.privacy.allowDataTelemetry ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        settings.privacy.allowDataTelemetry ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACCOUNT & SECURITY TAB */}
        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Clerk User Identity Card */}
            <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    className="w-14 h-14 rounded-full border-2 border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {user?.fullName || 'PrepPilot Candidate'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {user?.primaryEmailAddress?.emailAddress || 'No email associated'}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Check size={10} /> Authenticated via Clerk
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/profile')}
                className="w-full sm:w-auto rounded-xl gap-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span>Manage Profile & Security</span>
                <ExternalLink size={14} />
              </Button>
            </div>

            {/* Clerk Delegation Notice Card */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <Shield size={20} className="text-blue-600" />
                Account Security Handled by Clerk
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                PrepPilot AI utilizes enterprise-grade Clerk authentication to safeguard your credentials.
                Password updates, two-factor authentication (2FA), email verification, connected accounts
                (Google, GitHub), and active device sessions are managed exclusively on your profile page to
                ensure maximum security.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="rounded-xl gap-2 text-xs font-semibold bg-white"
                >
                  <span>Open Security Dashboard</span>
                  <ExternalLink size={12} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Save/Discard Action Bar when Dirty */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-slate-900/90 text-white px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-4 z-40 border border-slate-800"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-200">
              <Sparkles size={16} className="text-blue-400 shrink-0" />
              <span>You have unsaved changes</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={discardChanges}
                disabled={saving}
                className="h-9 px-3.5 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold"
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveChanges}
                disabled={saving}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Navigation Confirmation Dialog */}
      <AlertDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && blocker.state === 'blocked') {
            handleCancelNavigation();
          }
        }}
      >
        <AlertDialogContent className="rounded-2xl max-w-md p-6">
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-bold text-slate-900">
                  Unsaved Changes
                </AlertDialogTitle>
                <p className="text-xs text-slate-500">You have unsaved changes in your preferences</p>
              </div>
            </div>
            <AlertDialogDescription className="text-sm text-slate-600 pt-1">
              Leaving this page will discard the modifications you made to your interview and workspace preferences. How would you like to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <AlertDialogCancel
              className="rounded-xl px-4 py-2 text-xs font-semibold"
            >
              Stay on Page
            </AlertDialogCancel>

            <Button
              type="button"
              variant="outline"
              onClick={handleDiscardAndLeave}
              className="rounded-xl px-4 py-2 text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Discard & Leave
            </Button>

            <Button
              type="button"
              onClick={handleSaveAndLeave}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 gap-1.5 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save & Leave</span>
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
