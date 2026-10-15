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
    <div className={`rounded-xl p-4 sm:p-5 border ${borderColor} ${bgColor} shadow-xs`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
            <Icon size={22} />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Recruiter Verdict</h3>
            <div className="text-xl sm:text-2xl font-bold text-slate-800">{recommendation.verdict}</div>
          </div>
        </div>
        <div className="flex bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs gap-1">
          {renderStars(recommendation.rating)}
        </div>
      </div>
      
      <div className="bg-white/70 rounded-lg p-3.5 sm:p-4 border border-white/50">
        <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Evaluation Reasons</h4>
        <ul className="space-y-1.5">
          {recommendation.reasons.map((reason, i) => (
            <li key={i} className="flex gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className={`font-bold ${iconColor}`}>•</span>
              <span className="leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
