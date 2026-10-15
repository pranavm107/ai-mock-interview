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
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs animate-pulse h-48" aria-busy="true" aria-label="Loading readiness assessment">
        <div className="h-5 w-28 bg-slate-200 rounded mb-3"></div>
        <div className="h-9 w-20 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-full"></div>
          <div className="h-3.5 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !readiness) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center h-48">
        <AlertCircle className="text-slate-400 w-8 h-8 mb-2" />
        <p className="text-slate-500 text-xs sm:text-sm">Unable to load readiness assessment at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none opacity-40"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Target className="text-blue-600" size={18} />
            Coding Readiness
          </h2>
          <p className="text-slate-500 text-xs mb-4">Overall assessment based on consistency, difficulty progression, and topic mastery.</p>

          <div className="flex items-end gap-3 mb-5">
            <div className="flex flex-col">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{readiness.score}<span className="text-xl text-slate-400 font-normal">/100</span></span>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border mb-0.5 ${
              readiness.level === 'Interview Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              readiness.level === 'Building Foundations' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {readiness.level}
            </div>
          </div>

          <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100/60">
            <h3 className="font-semibold text-blue-900 mb-0.5 flex items-center gap-1.5 text-xs">
              <Sparkles size={13} className="text-blue-600" />
              Recommendation
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed">
              {readiness.recommendation}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-500" />
              Strengths
            </h3>
            {readiness.strengths.length > 0 ? (
              <ul className="space-y-1.5">
                {readiness.strengths.map((strength, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-1.5 text-xs text-slate-700"
                  >
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {strength}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No major strengths identified yet.</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-500" />
              Areas to Improve
            </h3>
            {readiness.improvementAreas.length > 0 ? (
              <ul className="space-y-1.5">
                {readiness.improvementAreas.map((area, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + (i * 0.1) }}
                    className="flex items-start gap-1.5 text-xs text-slate-700"
                  >
                    <span className="text-amber-500 mt-0.5">•</span>
                    {area}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No major improvement areas identified.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
