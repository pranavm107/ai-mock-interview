import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { SpeechAnalyticsRecord } from '../../../types/speech';

export interface SpeechTimelineProps {
  timeline: SpeechAnalyticsRecord[];
}

export const SpeechTimeline: React.FC<SpeechTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  const data = timeline.map((record) => ({
    name: `Q${record.questionIndex + 1}`,
    Fluency: record.analytics.fluencyScore,
    Grammar: record.analytics.grammarScore,
    Vocabulary: record.analytics.vocabularyScore,
    Communication: record.analytics.communicationScore
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="col-span-full bg-white/5 border border-white/10 rounded-xl p-4 mt-4"
    >
      <div className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center">
        <span className="mr-2">📈</span> Performance Timeline
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Communication" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Fluency" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Grammar" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Vocabulary" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
