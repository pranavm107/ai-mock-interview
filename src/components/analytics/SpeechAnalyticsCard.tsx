import React from 'react';
import type { SpeechAnalytics } from '../../types/analytics';
import { Mic, VolumeX, FastForward, Smile } from 'lucide-react';

interface SpeechAnalyticsCardProps {
  data: SpeechAnalytics;
}

export const SpeechAnalyticsCard: React.FC<SpeechAnalyticsCardProps> = ({ data }) => {
  const hasSpeechData = data && (
    data.averageSpeakingSpeed > 0 ||
    data.averageFillerWords > 0 ||
    data.averageSilenceDuration > 0 ||
    (data.averageConfidence !== undefined && data.averageConfidence > 0)
  );

  const silencePercentage = Math.round(
    data.averageSilenceRatio <= 1 ? data.averageSilenceRatio * 100 : data.averageSilenceRatio
  );

  const metrics = [
    {
      title: 'Filler Words',
      value: data.averageFillerWords,
      suffix: ' avg',
      icon: <Mic className="w-5 h-5 text-pink-500" />
    },
    {
      title: 'Silence Ratio',
      value: silencePercentage,
      suffix: '%',
      icon: <VolumeX className="w-5 h-5 text-slate-400" />
    },
    {
      title: 'Speaking Pace',
      value: data.averageSpeakingSpeed,
      suffix: ' WPM',
      icon: <FastForward className="w-5 h-5 text-blue-500" />
    },
    {
      title: 'Vocal Confidence',
      value: data.averageConfidence || 0,
      suffix: '/100',
      icon: <Smile className="w-5 h-5 text-yellow-500" />
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Speech Analytics</h3>
          {!hasSpeechData && (
            <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              Voice not recorded
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3">
              <div className="mt-1">{metric.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{metric.title}</p>
                <div className="flex items-baseline mt-1">
                  <span className="text-xl font-bold text-slate-900">{metric.value}</span>
                  <span className="text-xs text-slate-500 ml-1">{metric.suffix}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {!hasSpeechData && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          Audio analytics are captured during voice-enabled mock interviews.
        </p>
      )}
    </div>
  );
};
