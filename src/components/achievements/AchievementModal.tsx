import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Target, Star, FileText, Lock, X, Check, Award, Badge, Medal, Briefcase } from 'lucide-react';
import type { AchievementWithProgress, AchievementRarity } from '../../types/achievement';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getAchievementAction } from '../../utils/achievementNavigation';

const formatCategory = (category: string) => {
  if (!category) return '';
  return category.charAt(0) + category.slice(1).toLowerCase();
};

const getProgressContext = (achievement: AchievementWithProgress) => {
  const remaining = Math.max(0, achievement.requirementValue - achievement.progress);
  switch (achievement.requirementType) {
    case 'INTERVIEW_COUNT': 
      return { currentText: `${achievement.progress} / ${achievement.requirementValue}`, remainingText: `${remaining} more interviews to unlock` };
    case 'SCORE_THRESHOLD': 
      return { currentText: `${achievement.progress} / ${achievement.requirementValue}`, remainingText: `Target score: ${achievement.requirementValue}` };
    case 'STREAK_DAYS': 
      return { currentText: `${achievement.progress} / ${achievement.requirementValue} days`, remainingText: `${remaining} more days to unlock` };
    case 'ATS_SCORE': 
      return { currentText: `${achievement.progress} / ${achievement.requirementValue}`, remainingText: `Target ATS score: ${achievement.requirementValue}` };
    case 'RESUME_ADDED': 
      return { currentText: `${achievement.progress} / ${achievement.requirementValue}`, remainingText: `Add a resume to unlock` };
    default: 
      return { currentText: `${achievement.progress} / ${achievement.requirementValue}`, remainingText: `${remaining} more to unlock` };
  }
};

interface AchievementModalProps {
  achievement: AchievementWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'trophy': return Trophy;
    case 'flame': return Flame;
    case 'target': return Target;
    case 'star': return Star;
    case 'file': return FileText;
    case 'award': return Award;
    case 'badge': return Badge;
    case 'medal': return Medal;
    case 'briefcase': return Briefcase;
    default: return Trophy;
  }
};

const getRarityColor = (rarity: AchievementRarity, unlocked: boolean) => {
  if (!unlocked) return 'text-slate-500 bg-slate-100 border-slate-200';
  switch (rarity) {
    case 'COMMON': return 'text-slate-700 bg-slate-100 border-slate-200';
    case 'RARE': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'EPIC': return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'LEGENDARY': return 'text-amber-700 bg-amber-50 border-amber-200';
    default: return 'text-slate-700 bg-slate-100 border-slate-200';
  }
};

export const AchievementModal: React.FC<AchievementModalProps> = ({ achievement, isOpen, onClose }) => {
  const navigate = useNavigate();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!achievement) return null;

  const Icon = getIcon(achievement.icon);
  const isUnlocked = achievement.unlocked;
  const rarityColors = getRarityColor(achievement.rarity, isUnlocked);
  const safeProgress = Math.max(0, Math.min(100, achievement.progressPercentage || 0));
  const { currentText, remainingText } = getProgressContext(achievement);

  const renderCTA = () => {
    if (isUnlocked) {
      return (
        <Button onClick={onClose} variant="outline" className="w-full rounded-xl h-12">
          Close
        </Button>
      );
    }
    
    const action = getAchievementAction(achievement);
    if (action) {
      return (
        <Button 
          onClick={() => {
            navigate(action.route);
            onClose();
          }} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-semibold shadow-sm"
        >
          {action.label}
        </Button>
      );
    }
    
    return (
      <Button onClick={onClose} variant="outline" className="w-full rounded-xl h-12">
        Close
      </Button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-desc"
            >
              {/* Header decor */}
              <div className={`h-32 w-full absolute top-0 left-0 -z-10 ${isUnlocked ? 'bg-gradient-to-br from-blue-50 to-indigo-50/50' : 'bg-slate-50'}`} />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Close achievement details"
              >
                <X size={20} />
              </button>

              <div className="p-8 pt-10 flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl border-2 mb-6 ${rarityColors} shadow-sm`}>
                  {isUnlocked ? <Icon size={40} /> : <Lock size={40} />}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${rarityColors}`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-1 rounded border bg-slate-100 text-slate-600 border-slate-200">
                    {formatCategory(achievement.category)}
                  </span>
                </div>

                <h2 id="modal-title" className="text-2xl font-bold text-slate-900 mb-2">{achievement.title}</h2>
                <p id="modal-desc" className="text-slate-500 text-sm mb-8">{achievement.description}</p>

                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
                  {isUnlocked ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Check size={20} />
                        <span>Achievement Unlocked</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {achievement.unlockedAt ? `Unlocked on ${new Date(achievement.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}` : 'Unlocked recently'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>Progress</span>
                        <span>{safeProgress}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${safeProgress}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-slate-400 rounded-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{currentText}</span>
                        <span>{remainingText}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  {renderCTA()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
