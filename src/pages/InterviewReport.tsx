import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewReport } from '../hooks/useInterviewReport';
import { OverallScore } from '../components/report/OverallScore';
import { QuestionReview } from '../components/report/QuestionReview';
import { ActionableInsights } from '../components/report/ActionableInsights';
import { ReportSummary } from '../components/report/ReportSummary';
import { SpeechSummaryReport } from '../components/report/SpeechSummaryReport';
import { ATSReadiness } from '../components/report/ATSReadiness';
import { HiringRecommendation } from '../components/report/HiringRecommendation';
import { SkillMatrix } from '../components/report/SkillMatrix';
import { InterviewTimeline } from '../components/report/InterviewTimeline';
import { PageHeader } from '../components/dashboard/PageHeader';
import { AppBreadcrumb } from '../components/dashboard/AppBreadcrumb';
import { FileText, Loader2, ArrowLeft, Download } from 'lucide-react';

const InterviewReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { report, loading, error } = useInterviewReport(sessionId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-800">Analyzing your interview...</h3>
        <p className="text-slate-600 font-medium max-w-md">We're reviewing your answers and preparing personalized feedback.</p>
        <p className="text-slate-400 text-sm mt-4">This may take up to 30 seconds.</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Your interview was completed successfully.</h2>
        <p className="text-lg text-slate-600 mb-2">Detailed AI feedback is currently unavailable.</p>
        {error && <p className="text-sm text-rose-500 mb-8 max-w-md">{error}</p>}
        <p className="text-slate-500 mb-8">You can still view your interview history.</p>
        <button 
          onClick={() => navigate('/history')} 
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors shadow-sm"
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-5xl mx-auto space-y-12">
      <div>
        <div className="print:hidden">
          <AppBreadcrumb items={[
            { label: 'Practice' },
            { label: 'Mock Interviews', path: '/generate' },
            { label: 'Interview Report' }
          ]} />
        </div>
        <div className="flex justify-between items-start">
          <PageHeader 
            title="Interview Performance Report"
            description={`Generated on ${new Date(report.generatedAt).toLocaleDateString()} at ${new Date(report.generatedAt).toLocaleTimeString()}`}
            icon={FileText}
          />
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors print:hidden"
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="space-y-12 print:space-y-8">
        {report.overallEvaluation.summary && (
          <ReportSummary summary={report.overallEvaluation.summary} />
        )}

        {report.atsReadiness && (
          <ATSReadiness ats={report.atsReadiness} />
        )}

        {report.hiringRecommendation && (
          <HiringRecommendation recommendation={report.hiringRecommendation} />
        )}

        <OverallScore evaluation={report.overallEvaluation} />

        {report.speechSummary && (
          <SpeechSummaryReport summary={report.speechSummary} />
        )}
        
        {report.skillsAnalysis && (
          <SkillMatrix skills={report.skillsAnalysis} />
        )}
        
        <ActionableInsights 
          strengths={report.strengths} 
          weaknesses={report.weaknesses} 
          improvementPlan={report.improvementPlan} 
        />
        
        <QuestionReview evaluations={report.questionEvaluations} />

        {report.timeline && (
          <InterviewTimeline events={report.timeline} />
        )}
      </div>

    </div>
  );
};

export default InterviewReportPage;
