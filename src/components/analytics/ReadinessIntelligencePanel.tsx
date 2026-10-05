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
    <div className="space-y-6 mb-8">
      {/* Header & Readiness Score */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl shadow-xl overflow-hidden text-white">
        <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 text-indigo-300 font-medium tracking-wider uppercase text-sm">
              <BrainCircuit className="w-5 h-5" />
              <span>PrepPilot Intelligence</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Interview Readiness</h2>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-slate-300">
              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
                Confidence: <span className="text-white ml-1 font-medium">{profile.confidence}</span>
              </div>
              <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                Based on {profile.evidence.interviews} interviews & {profile.evidence.assessments} assessments
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 relative">
            <div className="w-40 h-40 rounded-full border-8 border-indigo-500/30 flex flex-col items-center justify-center relative bg-indigo-800/40 backdrop-blur-sm shadow-inner">
              <span className="text-5xl font-black">{profile.readinessScore}</span>
              <span className="text-indigo-200 text-sm font-medium mt-1">/ 100</span>
              <div className="absolute -bottom-4 bg-indigo-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg whitespace-nowrap border border-indigo-400">
                {profile.readinessState}
              </div>
            </div>
          </div>
        </div>
        
        {/* Components Bar */}
        <div className="bg-white/5 border-t border-white/10 px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile.components.map((comp, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-slate-400 text-xs font-medium uppercase">{comp.label}</span>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden mr-3">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${comp.score}%` }}></div>
                  </div>
                  <span className="font-semibold text-sm">{comp.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weaknesses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center text-slate-800 font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
              Top Areas to Improve
            </div>
          </div>
          <div className="p-6 space-y-4">
            {profile.weaknesses.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No significant weaknesses detected yet!</p>
            ) : (
              profile.weaknesses.slice(0, 4).map((w: WeaknessCard, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50">
                  <div>
                    <h4 className="font-bold text-slate-900">{w.topic}</h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>Performance: <span className="font-bold text-slate-700">{w.performance}%</span></span>
                      <span>•</span>
                      <span>{w.evidenceCount.interviews + w.evidenceCount.assessments} sessions</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    <TrendBadge trend={w.trend} />
                    <Link to={`/preparation/practice?topic=${encodeURIComponent(w.topic)}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
                      Practice Now <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Strengths & Priorities */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center text-slate-800 font-bold">
                <Zap className="w-5 h-5 text-amber-400 mr-2" />
                Your Strong Areas
              </div>
            </div>
            <div className="p-6">
              {profile.strengths.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Complete more sessions to identify strengths.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.strengths.slice(0, 5).map((s: StrengthCard, idx: number) => (
                    <div key={idx} className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-900 text-sm">{s.topic}</span>
                      <span className="text-emerald-700 text-xs font-bold ml-1">{s.performance}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-indigo-50 px-6 py-4">
              <h3 className="font-bold text-indigo-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-600" />
                Action Plan Priorities
              </h3>
            </div>
            <div className="p-0 divide-y divide-slate-100">
              {profile.priorities.map((p, idx) => (
                <div key={idx} className="px-6 py-4 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">
                    {p.priority}
                  </div>
                  <span className="font-medium text-slate-800 text-sm">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
