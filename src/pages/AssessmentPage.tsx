import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssessment } from '../hooks/useAssessment';
import { PageHeader } from '../components/dashboard/PageHeader';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { AssessmentQuestionViewer } from '../components/assessment/AssessmentQuestionViewer';
import { AssessmentResultViewer } from '../components/assessment/AssessmentResultViewer';
import type { Assessment, AssessmentQuestionForUser, AssessmentResult } from '../types/assessment';

const AssessmentPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const { fetchAssessment, fetchAssessmentResult, loading, error } = useAssessment();
  const [assessment, setAssessment] = React.useState<Assessment | null>(null);
  const [questions, setQuestions] = React.useState<AssessmentQuestionForUser[]>([]);
  const [result, setResult] = React.useState<AssessmentResult | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const loadAssessment = async () => {
      if (!assessmentId) return;
      try {
        const data = await fetchAssessment(assessmentId);
        setAssessment(data.assessment);
        if (data.questions) {
          setQuestions(data.questions);
        }
        if (data.result) {
          setResult(data.result);
        } else if (data.assessment.status === 'COMPLETED') {
          // Refresh-Safe Result Fetching
          try {
            const resultData = await fetchAssessmentResult(assessmentId);
            setResult(resultData.result);
          } catch (resultErr) {
            console.error('Failed to fetch result:', resultErr);
          }
        }
        
        // If generating, poll every 5 seconds
        if (data.assessment.status === 'GENERATING') {
          timeoutId = setTimeout(loadAssessment, 5000);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadAssessment();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [assessmentId, fetchAssessment, fetchAssessmentResult]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl flex items-center gap-4">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">Assessment Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Loading assessment...</p>
      </div>
    );
  }

  if (!assessment) return null;

  if (assessment.status === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-md mx-auto px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Sparkles className="w-16 h-16 text-primary animate-pulse relative z-10" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Analyzing Your Resume</h1>
        <p className="text-muted-foreground text-lg">
          PrepPilot AI is crafting personalized multiple-choice questions based on your skills, experience, and targeted projects. This usually takes about 10-15 seconds.
        </p>
        <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-full mt-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Generating questions...</span>
        </div>
      </div>
    );
  }

  if (assessment.status === 'FAILED') {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Generation Failed</h2>
          <p>We encountered an error while generating your assessment. Please try again with a different resume.</p>
          <button 
            onClick={() => navigate('/resume')}
            className="mt-6 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      <PageHeader 
        title={assessment.title || 'Skill Assessment'}
        description={assessment.status === 'COMPLETED' ? 'Review your assessment results and explanations.' : 'Complete this MCQ assessment tailored to your resume.'}
        icon={Sparkles}
      />
      
      {assessment.status === 'COMPLETED' ? (
        <AssessmentResultViewer assessment={assessment} result={result} />
      ) : (
        <AssessmentQuestionViewer 
          assessment={assessment} 
          questions={questions} 
          onCompleted={(updatedAssessment, newResult) => {
            setAssessment(updatedAssessment);
            setResult(newResult);
          }}
        />
      )}
    </div>
  );
};

export default AssessmentPage;
