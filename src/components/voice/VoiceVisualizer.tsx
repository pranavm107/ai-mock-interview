import React from 'react';


interface VoiceVisualizerProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isSpeaking, isListening }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background glow when active */}
        {(isSpeaking || isListening) && (
          <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${
            isSpeaking ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
          }`} />
        )}
        
        {/* Core circle */}
        <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-500 ${
          isSpeaking ? 'bg-indigo-600 shadow-lg shadow-indigo-500/50' : 
          isListening ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 
          'bg-slate-200'
        }`}>
          {isSpeaking && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-1.5 bg-white rounded-full animate-wave" style={{
                  height: `${Math.random() * 24 + 8}px`,
                  animationDelay: `${i * 0.1}s`
                }} />
              ))}
            </div>
          )}
          {isListening && (
            <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin" />
          )}
          {!isSpeaking && !isListening && (
            <div className="w-4 h-4 rounded-full bg-slate-400" />
          )}
        </div>
      </div>
      
      <div className="mt-6 text-lg font-medium text-slate-600 h-8">
        {isSpeaking && <span className="text-indigo-600">AI is speaking...</span>}
        {isListening && <span className="text-emerald-600">Listening...</span>}
        {!isSpeaking && !isListening && <span>Ready</span>}
      </div>
    </div>
  );
};
