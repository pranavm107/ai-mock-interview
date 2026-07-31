import React from 'react';
import { motion } from 'framer-motion';
import type { CommunicationAnalytics, SpeechAnalyticsRecord } from '../../../types/speech';
import { FluencyCard } from './FluencyCard';
import { GrammarCard } from './GrammarCard';
import { VocabularyCard } from './VocabularyCard';
import { PronunciationCard } from './PronunciationCard';
import { PaceCard } from './PaceCard';
import { PauseCard } from './PauseCard';
import { FillerWordsCard } from './FillerWordsCard';
import { CommunicationRecommendations } from './CommunicationRecommendations';
import { SpeechTimeline } from './SpeechTimeline';

interface CommunicationDashboardProps {
  analytics: CommunicationAnalytics;
  timeline?: SpeechAnalyticsRecord[];
  isVoice?: boolean;
}

export const CommunicationDashboard: React.FC<CommunicationDashboardProps> = ({ analytics, timeline, isVoice = false }) => {
  if (!analytics) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-6 border-t border-white/10 pt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium text-lg flex items-center">
          <span className="mr-2">🎙️</span> Communication & Speech
        </h3>
        <div className="flex items-center bg-white/5 rounded-full px-3 py-1">
          <span className="text-xs text-white/50 mr-2">Overall Score</span>
          <span className="text-sm text-emerald-400 font-bold">{analytics.communicationScore}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Language Metrics */}
        <FluencyCard score={analytics.fluencyScore} delay={0.1} />
        <GrammarCard score={analytics.grammarScore} delay={0.2} />
        <VocabularyCard score={analytics.vocabularyScore} delay={0.3} />

        {/* Voice Specific Metrics - Only render if voice session or show placeholders/graceful degradation */}
        {isVoice ? (
          <PronunciationCard score={analytics.pronunciationScore} delay={0.4} />
        ) : (
          <FillerWordsCard fillers={analytics.fillerWords} delay={0.4} />
        )}
        
        {/* Deep metrics */}
        <PaceCard pace={analytics.pace} delay={0.5} />
        
        {isVoice && (
          <PauseCard pauses={analytics.pauseMetrics} delay={0.6} />
        )}

        {isVoice && (
          <FillerWordsCard fillers={analytics.fillerWords} delay={0.7} />
        )}
        
        <CommunicationRecommendations recommendations={analytics.recommendations} delay={0.8} />

        {timeline && timeline.length > 0 && (
          <SpeechTimeline timeline={timeline} />
        )}
      </div>
    </motion.div>
  );
};
