import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewReport } from '../hooks/useInterviewReport';
import { OverallScore } from '../components/report/OverallScore';
import { QuestionReview } from '../components/report/QuestionReview';
import { ActionableInsights } from '../components/report/ActionableInsights';
import { ReportSummary } from '../components/report/ReportSummary';
import { ATSReadiness } from '../components/report/ATSReadiness';
import { HiringRecommendation } from '../components/report/HiringRecommendation';
import { SkillMatrix } from '../components/report/SkillMatrix';
import { InterviewTimeline } from '../components/report/InterviewTimeline';
import { PageHeader } from '../components/dashboard/PageHeader';
import { FileText, Loader2, ArrowLeft, Download } from 'lucide-react';

const InterviewReportPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { report, loading, error } = useInterviewReport(sessionId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-600 font-medium">Analyzing your interview and generating a detailed report...</p>
        <p className="text-slate-400 text-sm">This may take up to 30 seconds.</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center text-rose-600">
        <p className="text-lg font-medium">Failed to load interview report.</p>
        <p className="text-sm opacity-70 mt-2">{error}</p>
        <button onClick={() => navigate('/history')} className="mt-6 px-6 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 text-slate-700 font-semibold transition-colors">Return to History</button>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-5xl mx-auto space-y-12">
      <div>
        <button 
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors mb-6 print:hidden"
        >
          <ArrowLeft size={18} /> Back to History
        </button>
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
