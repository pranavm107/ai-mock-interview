
import type { SpeechSummary } from '../../types/speech';

export const SpeechSummaryReport = ({ summary }: { summary: SpeechSummary }) => {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <span className="mr-2 text-2xl">🎙️</span> Communication & Speech Metrics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Overall</div>
          <div className="text-2xl font-bold text-blue-600">{summary.overallCommunicationScore}/100</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Fluency</div>
          <div className="text-2xl font-bold text-slate-700">{summary.averageFluency}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Grammar</div>
          <div className="text-2xl font-bold text-slate-700">{summary.averageGrammar}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Vocabulary</div>
          <div className="text-2xl font-bold text-slate-700">{summary.averageVocabulary}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Pronunciation</div>
          <div className="text-2xl font-bold text-slate-700">{summary.averagePronunciation > 0 ? summary.averagePronunciation : 'N/A'}</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Pace (WPM)</div>
          <div className="text-2xl font-bold text-slate-700">{summary.averagePace}</div>
        </div>
      </div>

      {summary.topRecommendations && summary.topRecommendations.length > 0 && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">Communication Action Items</h4>
          <ul className="space-y-3">
            {summary.topRecommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-500 mr-3 mt-1">•</span>
                <span className="text-slate-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
