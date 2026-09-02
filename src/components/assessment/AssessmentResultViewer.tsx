import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Award, Target, BookOpen } from 'lucide-react';
import type { Assessment, AssessmentResult } from '../../types/assessment';

interface AssessmentResultViewerProps {
  assessment: Assessment;
  result: AssessmentResult | null;
}

export const AssessmentResultViewer: React.FC<AssessmentResultViewerProps> = ({ 
  assessment,
  result
}) => {
  if (!result) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Loading your results...
      </div>
    );
  }

  const { score, correctAnswers, totalQuestions, skillPerformance, questionResults } = result;
  
  let gradeColor = 'text-primary';
  let gradeBg = 'bg-primary/10 border-primary/20';
  if (score < 50) {
    gradeColor = 'text-destructive';
    gradeBg = 'bg-destructive/10 border-destructive/20';
  } else if (score < 80) {
    gradeColor = 'text-yellow-600 dark:text-yellow-500';
    gradeBg = 'bg-yellow-500/10 border-yellow-500/20';
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Level Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className={`md:col-span-1 rounded-2xl border p-8 flex flex-col items-center justify-center text-center ${gradeBg}`}>
          <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-4 border-current bg-background">
            <span className={`text-3xl font-bold ${gradeColor}`}>{score}%</span>
          </div>
          <h2 className={`text-xl font-semibold mb-1 ${gradeColor}`}>
            {score >= 80 ? 'Excellent Work!' : score >= 50 ? 'Good Effort!' : 'Needs Review'}
          </h2>
          <p className="text-sm text-foreground/80">
            You scored {correctAnswers} out of {totalQuestions} correct.
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Correct</span>
            </div>
            <span className="text-3xl font-bold text-foreground">{correctAnswers}</span>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="font-medium">Incorrect / Missed</span>
            </div>
            <span className="text-3xl font-bold text-foreground">{totalQuestions - correctAnswers}</span>
          </div>
        </div>
      </motion.div>

      {/* Skills Performance */}
      {skillPerformance && skillPerformance.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold">Skill Breakdown</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillPerformance.map(skill => (
              <div key={skill.skill} className="p-4 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="font-medium text-foreground block">{skill.skill}</span>
                  <span className="text-xs text-muted-foreground">{skill.correctAnswers} / {skill.totalQuestions} correct</span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${skill.percentage >= 70 ? 'text-emerald-500' : skill.percentage >= 40 ? 'text-yellow-500' : 'text-destructive'}`}>
                    {skill.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Detailed Review */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Detailed Review</h3>
        </div>

        {questionResults.map((qr, idx) => (
          <div key={qr.questionId} className={`p-6 rounded-2xl border ${qr.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                {qr.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Q{idx + 1}</span>
                  {qr.skill && (
                    <span className="px-2 py-0.5 bg-background border border-border/50 rounded text-xs text-muted-foreground">
                      {qr.skill}
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-medium text-foreground mb-4">{qr.question}</h4>
                
                <div className="space-y-2 mb-6">
                  {qr.options.map(opt => {
                    const isSelected = opt.id === qr.selectedOptionId;
                    const isCorrect = opt.id === qr.correctOptionId;
                    
                    let optClass = "border-border/50 bg-background text-foreground";
                    if (isCorrect) optClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium";
                    else if (isSelected && !isCorrect) optClass = "border-destructive bg-destructive/10 text-destructive font-medium";

                    return (
                      <div key={opt.id} className={`p-3 rounded-lg border ${optClass} flex items-center justify-between`}>
                        <span>{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive" />}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-background border border-border/50">
                  <span className="text-sm font-semibold text-primary block mb-1">Explanation</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {qr.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
