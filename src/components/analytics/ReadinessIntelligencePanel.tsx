import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle, ShieldCheck, Zap, ArrowRight, Activity, BatteryCharging, BrainCircuit } from 'lucide-react';
import { useReadiness } from '../../hooks/useReadiness';
import { Link } from 'react-router-dom';
import type { WeaknessCard, StrengthCard, TrendDirection } from '../../../server/src/types/readiness';

const TrendBadge: React.FC<{ trend: TrendDirection }> = ({ trend }) => {
  if (trend === 'Improving') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><TrendingUp className="w-3 h-3 mr-1" /> Improving</span>;
  }
  if (trend === 'Declining') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><Activity className="w-3 h-3 mr-1" /> Declining</span>;
  }
  if (trend === 'Stable') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800"><Target className="w-3 h-3 mr-1" /> Stable</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">Not Enough Data</span>;
};

export const ReadinessIntelligencePanel: React.FC = () => {
  const { data: profile, loading, error, fetchReadiness } = useReadiness();

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900">We couldn't load your readiness profile right now.</h3>
        <p className="text-slate-500 mt-2">{error}</p>
      </div>
    );
  }

  if (profile.hasInsufficientData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <BatteryCharging className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Not enough data yet</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Complete more interviews and assessments to build a reliable readiness profile. We need at least 2 sessions to generate longitudinal intelligence.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/generate" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Start Interview
          </Link>
          <Link to="/preparation/practice" className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
            Take Assessment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-4 sm:mb-5">
      {/* Header & Readiness Score */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl shadow-xs overflow-hidden text-white">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-1.5 mb-1.5 text-indigo-300 font-medium tracking-wider uppercase text-xs">
              <BrainCircuit className="w-4 h-4" />
              <span>PrepPilot Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Interview Readiness</h2>
            
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
              <div className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Confidence: <span className="text-white ml-1 font-medium">{profile.confidence}</span>
              </div>
              <div className="flex items-center bg-white/10 px-2.5 py-0.5 rounded-full text-[11px]">
                Based on {profile.evidence.interviews} interviews & {profile.evidence.assessments} assessments
              </div>
            </div>
          </div>
          
          <div className="shrink-0 relative">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 flex flex-col items-center justify-center relative bg-indigo-800/40 backdrop-blur-sm shadow-inner">
              <span className="text-2xl font-bold leading-none">{profile.readinessScore}</span>
              <span className="text-indigo-200 text-[10px] font-medium mt-0.5">/ 100</span>
              <div className="absolute -bottom-2 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-xs whitespace-nowrap border border-indigo-400">
                {profile.readinessState}
              </div>
            </div>
          </div>
        </div>
        
        {/* Components Bar */}
        <div className="bg-white/5 border-t border-white/10 px-4 py-2.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {profile.components.map((comp, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-medium uppercase">{comp.label}</span>
                <div className="flex items-center mt-0.5">
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${comp.score}%` }}></div>
                  </div>
                  <span className="font-semibold text-xs">{comp.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Weaknesses */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center text-slate-800 text-xs sm:text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" />
              Top Areas to Improve
            </div>
          </div>
          <div className="p-3.5 sm:p-4 space-y-2">
            {profile.weaknesses.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-3">No significant weaknesses detected yet!</p>
            ) : (
              profile.weaknesses.slice(0, 4).map((w: WeaknessCard, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors hover:bg-slate-50">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">{w.topic}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Performance: <span className="font-bold text-slate-700">{w.performance}%</span></span>
                      <span>•</span>
                      <span>{w.evidenceCount.interviews + w.evidenceCount.assessments} sessions</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 shrink-0">
                    <TrendBadge trend={w.trend} />
                    <Link to={`/preparation/practice?topic=${encodeURIComponent(w.topic)}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                      Practice Now <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Strengths & Priorities */}
        <div className="space-y-3.5 sm:space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center text-slate-800 text-xs sm:text-sm font-semibold">
                <Zap className="w-4 h-4 text-amber-500 mr-1.5" />
                Your Strong Areas
              </div>
            </div>
            <div className="p-3.5 sm:p-4">
              {profile.strengths.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-3">Complete more sessions to identify strengths.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {profile.strengths.slice(0, 5).map((s: StrengthCard, idx: number) => (
                    <div key={idx} className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-medium text-emerald-900 text-xs">{s.topic}</span>
                      <span className="text-emerald-700 text-xs font-bold ml-0.5">{s.performance}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden">
            <div className="border-b border-slate-200 bg-indigo-50/70 px-4 py-2.5">
              <h3 className="font-semibold text-xs sm:text-sm text-indigo-950 flex items-center">
                <Target className="w-4 h-4 mr-1.5 text-indigo-600" />
                Action Plan Priorities
              </h3>
            </div>
            <div className="p-0 divide-y divide-slate-100">
              {profile.priorities.map((p, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-center">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold mr-2.5 shrink-0">
                    {p.priority}
                  </div>
                  <span className="font-medium text-slate-800 text-xs">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
