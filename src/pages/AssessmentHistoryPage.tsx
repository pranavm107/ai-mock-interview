import React, { useEffect, useState, useCallback } from 'react';
import { useAssessment } from '../hooks/useAssessment';
import { PageHeader } from '../components/dashboard/PageHeader';
import { Star, Loader2, AlertCircle, FileText, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Assessment } from '../types/assessment';
import { Button } from '@/components/ui/button';

export const AssessmentHistoryPage: React.FC = () => {
  const { fetchAssessmentHistory, loading, error } = useAssessment();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  const loadHistory = useCallback(async (cursor?: string) => {
    try {
      const data = await fetchAssessmentHistory({
        limit: 10,
        cursor,
        resumeId: resumeId || undefined
      });
      if (cursor) {
        setAssessments(prev => [...prev, ...data.assessments]);
      } else {
        setAssessments(data.assessments);
      }
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchAssessmentHistory, resumeId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleLoadMore = () => {
    if (nextCursor) {
      loadHistory(nextCursor);
    }
  };

  const handleNavigateToAssessment = (id: string) => {
    navigate(`/assessment/${id}`);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-lg">Loading assessment history...</p>
      </div>
    );
  }

  if (error && assessments.length === 0) {
    return (
      <div className="p-8 pb-24 max-w-5xl mx-auto">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl flex items-center gap-4">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">Error Loading History</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-5xl mx-auto space-y-8">
      <PageHeader 
        title={resumeId ? "Resume Skill Assessments" : "Skill Assessments"} 
        description="Review your past skill assessments and track your performance."
        icon={Star}
      />
      
      {assessments.length === 0 ? (
        <div className="bg-card rounded-3xl border p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">No Assessments Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Create a resume-based skill assessment to start tracking your progress.
          </p>
          {!resumeId && (
            <Button onClick={() => navigate('/resume')} className="px-8 h-12 rounded-xl text-base font-semibold">
              Go to Resumes
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map(assessment => {
            const date = assessment.createdAt ? new Date(assessment.createdAt) : new Date();
            const isCompleted = assessment.status === 'COMPLETED';
            const isFailed = assessment.status === 'FAILED';
            return (
              <div key={assessment.id} className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${isCompleted ? 'bg-green-100 text-green-600' : isFailed ? 'bg-red-100 text-red-600' : 'bg-primary/20 text-primary'}`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : isFailed ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {assessment.title || 'Skill Assessment'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{date.toLocaleDateString()}</span>
                      {assessment.type === 'RESUME_MCQ' && (
                        <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                          Resume Match
                        </span>
                      )}
                      <span className="capitalize">{assessment.status.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                  {isCompleted && typeof assessment.score === 'number' && typeof assessment.questionCount === 'number' && assessment.questionCount > 0 && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {Math.round((assessment.score / assessment.questionCount) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  )}
                  <Button 
                    variant={isCompleted ? 'outline' : 'default'}
                    onClick={() => handleNavigateToAssessment(assessment.id)}
                    className="rounded-xl px-6"
                  >
                    {isCompleted ? 'View Result' : 'Continue'}
                  </Button>
                </div>
              </div>
            );
          })}

          {nextCursor && (
            <div className="flex justify-center pt-8">
              <Button 
                variant="outline" 
                onClick={handleLoadMore} 
                disabled={loading}
                className="rounded-xl px-8 h-12"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssessmentHistoryPage;
