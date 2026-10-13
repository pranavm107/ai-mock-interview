import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { codingFrontendService } from '../../services/codingFrontendService';
import type { CodingReadinessData } from '../../types/coding';
import { Target, TrendingUp, AlertCircle, Sparkles, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const CodingReadiness: React.FC = () => {
  const { getToken } = useAuth();
  const [readiness, setReadiness] = useState<CodingReadinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const data = await codingFrontendService.getReadinessData(token, tz);
        setReadiness(data);
      } catch (err) {
        console.error('Error fetching readiness:', err);
        setError('Failed to load readiness score.');
      } finally {
        setLoading(false);
      }
    };
    fetchReadiness();
  }, [getToken]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm animate-pulse h-64" aria-busy="true" aria-label="Loading readiness assessment">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="h-12 w-24 bg-slate-200 rounded mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !readiness) {
    return (
      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-64">
        <AlertCircle className="text-slate-400 w-12 h-12 mb-3" />
        <p className="text-slate-500">Unable to load readiness assessment at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none opacity-50"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Target className="text-blue-600" size={24} />
            Coding Readiness
          </h2>
          <p className="text-slate-500 text-sm mb-6">Your overall assessment based on problem-solving consistency, difficulty progression, and topic mastery.</p>

          <div className="flex items-end gap-4 mb-8">
            <div className="flex flex-col">
              <span className="text-5xl font-black text-slate-900 tracking-tight">{readiness.score}<span className="text-2xl text-slate-400">/100</span></span>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold border mb-1 ${
              readiness.level === 'Interview Ready' ? 'bg-green-100 text-green-700 border-green-200' :
              readiness.level === 'Building Foundations' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {readiness.level}
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
            <h3 className="font-semibold text-blue-900 mb-1 flex items-center gap-2 text-sm">
              <Sparkles size={16} className="text-blue-600" />
              Recommendation
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              {readiness.recommendation}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 pt-6 md:pt-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              Strengths
            </h3>
            {readiness.strengths.length > 0 ? (
              <ul className="space-y-2">
                {readiness.strengths.map((strength, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="text-green-500 mt-0.5">•</span>
                    {strength}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No major strengths identified yet.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} className="text-orange-500" />
              Areas to Improve
            </h3>
            {readiness.improvementAreas.length > 0 ? (
              <ul className="space-y-2">
                {readiness.improvementAreas.map((area, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span className="text-orange-500 mt-0.5">•</span>
                    {area}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No major improvement areas identified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
