
import type { SpeechSummary } from '../../types/speech';

export const SpeechSummaryReport = ({ summary }: { summary: SpeechSummary }) => {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs print:shadow-none print:border-slate-300">
      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="mr-2 text-xl">🎙️</span> Communication & Speech Metrics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mb-5">
        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-center">
          <div className="text-xs font-medium text-slate-500 mb-0.5">Overall</div>
          <div className="text-lg sm:text-xl font-bold text-blue-600">{summary.overallCommunicationScore}/100</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-medium text-slate-500 mb-0.5">Fluency</div>
          <div className="text-lg sm:text-xl font-bold text-slate-700">{summary.averageFluency}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-medium text-slate-500 mb-0.5">Grammar</div>
          <div className="text-lg sm:text-xl font-bold text-slate-700">{summary.averageGrammar}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-medium text-slate-500 mb-0.5">Vocabulary</div>
          <div className="text-lg sm:text-xl font-bold text-slate-700">{summary.averageVocabulary}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-medium text-slate-500 mb-0.5">Pronunciation</div>
          <div className="text-lg sm:text-xl font-bold text-slate-700">{summary.averagePronunciation > 0 ? summary.averagePronunciation : 'N/A'}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
          <div className="text-xs font-medium text-slate-500 mb-0.5">Pace (WPM)</div>
          <div className="text-lg sm:text-xl font-bold text-slate-700">{summary.averagePace}</div>
        </div>
      </div>

      {summary.topRecommendations && summary.topRecommendations.length > 0 && (
        <div className="bg-indigo-50/70 p-3.5 sm:p-4 rounded-lg border border-indigo-100">
          <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2.5">Communication Action Items</h4>
          <ul className="space-y-1.5">
            {summary.topRecommendations.map((rec, index) => (
              <li key={index} className="flex items-start text-xs sm:text-sm">
                <span className="text-indigo-500 mr-2.5 mt-0.5">•</span>
                <span className="text-slate-700 leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
