import React from 'react';
import type { HiringRecommendation as HiringRecommendationType } from '../../../server/src/types/interviewReport';
import { ShieldCheck, ShieldAlert, Shield, Star, StarHalf } from 'lucide-react';

interface Props {
  recommendation: HiringRecommendationType;
}

export const HiringRecommendation: React.FC<Props> = ({ recommendation }) => {
  const isRecommended = recommendation.verdict === 'Recommended';
  const isHold = recommendation.verdict === 'Hold';
  
  const Icon = isRecommended ? ShieldCheck : isHold ? Shield : ShieldAlert;
  
  const bgColor = isRecommended ? 'bg-emerald-50' : isHold ? 'bg-orange-50' : 'bg-rose-50';
  const borderColor = isRecommended ? 'border-emerald-200' : isHold ? 'border-orange-200' : 'border-rose-200';
  const iconColor = isRecommended ? 'text-emerald-600' : isHold ? 'text-orange-600' : 'text-rose-600';
  const iconBg = isRecommended ? 'bg-emerald-100' : isHold ? 'bg-orange-100' : 'bg-rose-100';

  // Helper to render stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === rating) {
        stars.push(<StarHalf key={i} size={20} className="fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={20} className="text-slate-300" />);
      }
    }
    return stars;
  };

  return (
    <div className={`rounded-3xl p-8 border ${borderColor} ${bgColor} shadow-sm`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${iconBg} ${iconColor}`}>
            <Icon size={28} />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Recruiter Verdict</h3>
            <div className="text-2xl font-bold text-slate-800">{recommendation.verdict}</div>
          </div>
        </div>
        <div className="flex bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm gap-1">
          {renderStars(recommendation.rating)}
        </div>
      </div>
      
      <div className="bg-white/60 rounded-2xl p-6 border border-white/40">
        <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Reasons</h4>
        <ul className="space-y-2">
          {recommendation.reasons.map((reason, i) => (
            <li key={i} className="flex gap-3 text-slate-700">
              <span className={`mt-1 font-bold ${iconColor}`}>•</span>
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
