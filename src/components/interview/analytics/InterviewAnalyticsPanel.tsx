import React from 'react';
import type { LiveEvaluation } from '../../../types/liveEvaluation';
import type { DecisionType } from '../../../types/decision';
import type { DifficultyLevel, AdaptiveEvaluationResult } from '../../../types/adaptive';
import { EmptyAnalytics } from './EmptyAnalytics';
import { LoadingAnalytics } from './LoadingAnalytics';
import { AnalyticsError } from './AnalyticsError';
import { OverallScoreCard } from './OverallScoreCard';
import { AnalyticsGrid } from './AnalyticsGrid';
import { SkillMatrix } from './SkillMatrix';
import { ConfidenceTimeline } from './ConfidenceTimeline';
import { StrengthsPanel } from './StrengthsPanel';
import { WeaknessesPanel } from './WeaknessesPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import { QuestionProgress } from './QuestionProgress';
import { DifficultyIndicator } from './DifficultyIndicator';
import { PerformanceTrend } from './PerformanceTrend';
import { CommunicationDashboard } from '../speech/CommunicationDashboard';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CommunicationAnalytics, SpeechAnalyticsRecord } from '../../../types/speech';

interface InterviewAnalyticsPanelProps {
  evaluation: LiveEvaluation | null;
  decision?: DecisionType | null;
  difficulty?: DifficultyLevel | null;
  remainingQuestions?: number | null;
  remainingTime?: number | null;
  confidence?: number | null;
  adaptiveResult?: AdaptiveEvaluationResult | null;
  communicationAnalytics?: CommunicationAnalytics | null;
  speechTimeline?: SpeechAnalyticsRecord[] | null;
  isLoading: boolean;
  error: string | null;
  hasStarted: boolean;
}

export const InterviewAnalyticsPanel: React.FC<InterviewAnalyticsPanelProps> = ({
  evaluation,
  decision,
  difficulty,
  remainingQuestions,
  remainingTime,
  confidence,
  adaptiveResult,
  communicationAnalytics,
  speechTimeline,
  isLoading,
  error
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-slate-50 border-l border-slate-200">
      <div className="p-5 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Live Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-600 tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyticsError />
            </motion.div>
          )}

          {isLoading && !evaluation && !error && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingAnalytics />
            </motion.div>
          )}

          {!evaluation && !isLoading && !error && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyAnalytics />
            </motion.div>
          )}

          {evaluation && !error && (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <DifficultyIndicator difficulty={(difficulty || evaluation.interviewProgress.currentDifficulty) as any} />
                  <PerformanceTrend trend={evaluation.performanceTrend} />
                </div>
                <QuestionProgress 
                  currentQuestion={(evaluation.interviewProgress?.currentQuestionIndex ?? 0) + 1} 
                  totalQuestions={evaluation.interviewProgress?.totalQuestions ?? (remainingQuestions || 0)} 
                />
              </div>

              {/* Adaptive Insights */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Decision</span>
                   <p className="font-semibold text-slate-800 text-sm mt-1">{decision ? decision.replace(/_/g, ' ') : 'N/A'}</p>
                 </div>
                 <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
                   <p className="font-semibold text-slate-800 text-sm mt-1">{remainingQuestions !== null && remainingQuestions !== undefined ? `${remainingQuestions} Questions Left` : 'N/A'}</p>
                 </div>
                 <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Time</span>
                   <p className="font-semibold text-slate-800 text-sm mt-1">{remainingTime ? `${Math.ceil(remainingTime / 60000)} min remaining` : 'N/A'}</p>
                 </div>
                 <div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Confidence</span>
                   <p className="font-semibold text-slate-800 text-sm mt-1">{confidence !== null && confidence !== undefined ? `${Math.round(confidence > 1 ? confidence : confidence * 100)}%` : 'N/A'}</p>
                 </div>
                 <div className="col-span-2">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Follow-up Status</span>
                   <p className="font-semibold text-slate-800 text-sm mt-1">{adaptiveResult?.followUpQuestion ? 'Follow-up Generated' : 'No Follow-up'}</p>
                 </div>
              </div>

              {/* Main Scores */}
              <OverallScoreCard score={evaluation.overallScore} />
              <AnalyticsGrid evaluation={evaluation} />

              {/* Advanced Analytics */}
              <SkillMatrix skills={evaluation.skillMatrix} />
              <ConfidenceTimeline timeline={evaluation.confidenceTimeline} />
              
              {/* Qualitative Feedback */}
              <RecommendationsPanel weaknesses={evaluation.weaknesses} />
              <StrengthsPanel strengths={evaluation.strengths} />
              <WeaknessesPanel weaknesses={evaluation.weaknesses} />
              
              {/* Communication Dashboard */}
              {communicationAnalytics && (
                <div className="bg-slate-800 p-5 rounded-2xl shadow-xl overflow-hidden mt-6 relative">
                  <CommunicationDashboard 
                    analytics={communicationAnalytics} 
                    timeline={speechTimeline || undefined}
                    isVoice={communicationAnalytics.pronunciationScore > 0} 
                  />
                </div>
              )}
              
              <div className="h-8"></div> {/* Bottom spacer */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
