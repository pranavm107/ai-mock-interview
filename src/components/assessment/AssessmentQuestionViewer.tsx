import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAssessment } from '../../hooks/useAssessment';
import type { Assessment, AssessmentQuestionForUser, AssessmentSubmissionRequest, AssessmentResult } from '../../types/assessment';

interface AssessmentQuestionViewerProps {
  assessment: Assessment;
  questions: AssessmentQuestionForUser[];
  onCompleted: (assessment: Assessment, newResult: AssessmentResult) => void;
}

export const AssessmentQuestionViewer: React.FC<AssessmentQuestionViewerProps> = ({ 
  assessment, 
  questions,
  onCompleted
}) => {
  const { submitAssessment, loading } = useAssessment();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  if (!questions || questions.length === 0) {
    return <div className="text-center p-8">No questions found for this assessment.</div>;
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(curr => curr + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(curr => curr - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: AssessmentSubmissionRequest = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId
        }))
      };
      
      const { result } = await submitAssessment(assessment.id, payload);
      // We mutate the assessment status to COMPLETED locally and trigger re-render in parent
      onCompleted({ ...assessment, status: 'COMPLETED' }, result);
    } catch (err) {
      console.error('Submission failed', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-3">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{progress}% Completed</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
              {currentQuestion.difficulty}
            </span>
            {currentQuestion.skill && (
              <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full">
                {currentQuestion.skill}
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-8 leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4
                    ${isSelected 
                      ? 'border-primary bg-primary/5 text-primary-foreground shadow-sm' 
                      : 'border-border/50 bg-card hover:border-primary/40 hover:bg-muted text-foreground'
                    }
                  `}
                >
                  <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{option.text}</span>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length === 0}
            className="w-full sm:w-auto px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {loading ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion.id] === undefined}
            className="w-full sm:w-auto px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
