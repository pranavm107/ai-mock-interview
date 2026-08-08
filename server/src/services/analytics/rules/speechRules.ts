import { AnalyticsRecommendation } from '../../../types/analyticsResponse';
import { RuleContext } from './recommendationTypes';

export const evaluateSpeechRules = (context: RuleContext): AnalyticsRecommendation[] => {
  const recommendations: AnalyticsRecommendation[] = [];
  const { speechAnalytics } = context;

  // Thresholds based on general speaking guidelines
  const HIGH_FILLER_WORDS = 15;
  const HIGH_SILENCE_RATIO = 0.20; // 20%
  const FAST_SPEED_WPM = 170;
  const SLOW_SPEED_WPM = 110;

  // High filler words
  if (speechAnalytics.averageFillerWords > HIGH_FILLER_WORDS) {
    recommendations.push({
      id: 'speech-filler',
      priority: 'MEDIUM',
      title: 'Reduce filler words',
      description: `You use an average of ${speechAnalytics.averageFillerWords} filler words per session.`,
      action: 'Reduce "um", "uh", "like"',
      category: 'Speech'
    });
  }

  // High silence ratio
  if (speechAnalytics.averageSilenceRatio > HIGH_SILENCE_RATIO) {
    recommendations.push({
      id: 'speech-silence',
      priority: 'LOW',
      title: 'Reduce long pauses',
      description: `You spend ${Math.round(speechAnalytics.averageSilenceRatio * 100)}% of your speaking time in silence.`,
      action: 'Answer more confidently',
      category: 'Speech'
    });
  }

  // Fast speaking
  if (speechAnalytics.averageSpeakingSpeed > FAST_SPEED_WPM) {
    recommendations.push({
      id: 'speech-fast',
      priority: 'MEDIUM',
      title: 'Slow down',
      description: `Your average pace of ${speechAnalytics.averageSpeakingSpeed} WPM is very fast.`,
      action: 'Improve clarity by pacing yourself',
      category: 'Speech'
    });
  }

  // Slow speaking
  if (speechAnalytics.averageSpeakingSpeed > 0 && speechAnalytics.averageSpeakingSpeed < SLOW_SPEED_WPM) {
    recommendations.push({
      id: 'speech-slow',
      priority: 'LOW',
      title: 'Increase speaking pace',
      description: `Your average pace of ${speechAnalytics.averageSpeakingSpeed} WPM is quite slow.`,
      action: 'Practice speaking fluidly',
      category: 'Speech'
    });
  }

  return recommendations;
};
