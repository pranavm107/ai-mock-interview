import React, { useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Play, RotateCcw, AlertCircle, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { motion } from 'framer-motion';
import { useInterview } from '../hooks/useInterview';
import { useResume } from '../hooks/useResume';
import { generateInterviewSlug } from '../utils/slugHelper';
import { API_BASE_URL } from '../config/api';
import type { InterviewType, InterviewDifficulty, ExperienceLevel } from '../types';

interface SmartSetupResult {
  role: string;
  company: string;
  experienceLevel: ExperienceLevel;
  recommendedInterviewType: InterviewType;
  recommendedDifficulty: InterviewDifficulty;
  recommendedQuestionCount: number;
  skills: string[];
  focusAreas: string[];
  reasoning: string;
  confidence: "High" | "Medium" | "Low";
}

const Generate: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { createInterview, loading: creatingInterview } = useInterview();
  const { resumes, loading: loadingResumes } = useResume();

  const location = useLocation();
  const recommendation = location.state?.recommendation;

  const difficultyMap: Record<string, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };

  const experienceMap: Record<string, string> = {
    Student: 'Fresher',
    Junior: 'Junior',
    Mid: 'Mid',
    Senior: 'Senior',
    Lead: 'Senior',
  };

  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmartSetupResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    resumeId: '',
    company: recommendation?.targetCompany || '',
    role: recommendation?.targetRole || '',
    interviewType: (recommendation?.interviewType || 'Technical') as InterviewType,
    difficulty: (recommendation ? (difficultyMap[recommendation.difficulty] || 'Medium') : 'Medium') as InterviewDifficulty,
    experienceLevel: (recommendation ? (experienceMap[recommendation.experienceLevel] || 'Mid') : 'Mid') as ExperienceLevel,
    language: 'English',
    duration: recommendation?.durationMinutes || 30,
    totalQuestions: recommendation?.questionCount || 5,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleReset = () => {
    setFormData({
      resumeId: resumes.length > 0 ? (resumes.find(r => r.isDefault)?.id || resumes[0].id) : '',
      company: '',
      role: '',
      interviewType: 'Technical',
      difficulty: 'Medium',
      experienceLevel: 'Mid',
      language: 'English',
      duration: 30,
      totalQuestions: 5,
    });
    setJobDescription('');
    setAnalysisResult(null);
    setAnalysisError(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!formData.resumeId && !jobDescription.trim()) {
      setAnalysisError("Please provide either a Resume or a Job Description to analyze.");
      return;
    }
    
    try {
      setAnalyzing(true);
      setAnalysisError(null);
      const token = await getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/interviews/smart-setup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          resumeId: formData.resumeId || null,
          jobDescription: jobDescription.trim() || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || 'Failed to analyze context.');
      }

      const { data } = await response.json();
      setAnalysisResult(data);
      
      // Auto-fill form data with recommendations
      setFormData(prev => ({
        ...prev,
        role: data.role || prev.role,
        company: data.company || prev.company,
        experienceLevel: data.experienceLevel || prev.experienceLevel,
        interviewType: data.recommendedInterviewType || prev.interviewType,
        difficulty: data.recommendedDifficulty || prev.difficulty,
        totalQuestions: data.recommendedQuestionCount || prev.totalQuestions,
      }));

    } catch (err: any) {
      setAnalysisError(err.message || 'We couldn\'t analyze your information right now. You can continue with manual setup.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user?.id) return;
    
    if (!formData.company || !formData.role) {
      setError("Company and Role are required.");
      return;
    }

    try {
      setGenerating(true);
      
      const token = await getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/interviews/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          userId: user.id,
          resumeId: formData.resumeId || null,
          targetCompany: formData.company,
          targetRole: formData.role,
          interviewType: formData.interviewType,
          difficulty: formData.difficulty,
          candidateExperienceLevel: formData.experienceLevel,
          language: formData.language,
          totalQuestions: formData.totalQuestions,
          company: formData.company,
          role: formData.role,
          experience: formData.experienceLevel,
          questionCount: formData.totalQuestions
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate questions from AI.');
      }

      const responseData = await response.json();

      if (responseData.id) {
        const interviewId = responseData.id;
        
        if (formData.interviewType === 'MCQ') {
          navigate(`/mcq/${interviewId}`);
          return;
        }

        const sessionResponse = await fetch(`${API_BASE_URL}/api/interview-sessions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            userId: user.id,
            interviewId: interviewId
          })
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          navigate(`/session/${sessionData.id}`);
          return;
        }
      }

      const questionsArray = Array.isArray(responseData) ? responseData : (responseData.interview?.questions || []);
      const mockQuestions = questionsArray.map((q: any, index: number) => ({
        order: index + 1,
        question: q.question || q.title || 'Interview Question',
        expectedAnswer: q.expectedAnswer || q.answer || '',
        answer: '',
        answerDuration: 0,
        score: null,
        feedback: null,
        status: 'pending'
      }));

      const newInterview = await createInterview(
        user.id,
        {
          resumeId: formData.resumeId || null,
          title: `${formData.company} ${formData.role} Interview`,
          company: formData.company,
          role: formData.role,
          interviewType: formData.interviewType,
          difficulty: formData.difficulty,
          experienceLevel: formData.experienceLevel,
          language: formData.language,
          totalQuestions: formData.totalQuestions,
          duration: formData.duration || 30,
          aiProvider: 'Groq',
          feedbackId: null
        },
        mockQuestions
      );

      navigate(`/interview/${generateInterviewSlug(newInterview)}`);
      
    } catch (err: any) {
      setError(err.message || 'We couldn\'t generate the interview right now. Your setup is still saved. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const isRecommended = (field: keyof SmartSetupResult, currentVal: any) => {
    if (!analysisResult) return false;
    // Map between form fields and analysis fields
    let aiVal: any;
    if (field === 'role') aiVal = analysisResult.role;
    if (field === 'company') aiVal = analysisResult.company;
    if (field === 'experienceLevel') aiVal = analysisResult.experienceLevel;
    if (field === 'recommendedInterviewType') aiVal = analysisResult.recommendedInterviewType;
    if (field === 'recommendedDifficulty') aiVal = analysisResult.recommendedDifficulty;
    if (field === 'recommendedQuestionCount') aiVal = analysisResult.recommendedQuestionCount;

    return aiVal === currentVal;
  };

  return (
    <div className="pb-24">
      <PageHeader 
        title="Smart Interview Setup" 
        description="Provide your context, get AI recommendations, and review your configuration before generating the interview."
        icon={Sparkles}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Step 1: Context & Analysis */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> 
            1. Provide Context
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Select Resume (Optional)</label>
                <select 
                  value={formData.resumeId}
                  onChange={e => {
                    setFormData({...formData, resumeId: e.target.value});
                    setAnalysisResult(null); // Reset analysis if context changes
                  }}
                  disabled={loadingResumes || resumes.length === 0}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">No Resume Context</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.metadata?.title || r.metadata?.fileName || r.id}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Job Description (Optional)</label>
                <textarea 
                  value={jobDescription}
                  onChange={e => {
                    setJobDescription(e.target.value);
                    setAnalysisResult(null);
                  }}
                  placeholder="Paste the job description here..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || (!formData.resumeId && !jobDescription.trim())}
                className="w-full py-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <><Loader2 size={18} className="animate-spin" /> Analyzing context...</>
                ) : (
                  <><Sparkles size={18} /> Analyze & Recommend</>
                )}
              </button>

              {analysisError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm font-medium">
                  {analysisError}
                </div>
              )}
            </div>

            {/* Analysis Result Panel */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              {analysisResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-4">
                    <CheckCircle2 size={20} /> Setup recommendations ready
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Why this setup?</h3>
                    <p className="text-sm text-slate-600">{analysisResult.reasoning}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Confidence:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        analysisResult.confidence === 'High' ? 'bg-emerald-100 text-emerald-700' :
                        analysisResult.confidence === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {analysisResult.confidence}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Key Skills Detected</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {skill}
                        </span>
                      ))}
                      {analysisResult.skills.length === 0 && <span className="text-sm text-slate-500">None detected</span>}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Expected Focus Areas</h3>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc pl-4">
                      {analysisResult.focusAreas.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                      {analysisResult.focusAreas.length === 0 && <li>None detected</li>}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                  <Sparkles size={32} className="mb-3 text-slate-300" />
                  <p className="font-medium text-slate-700">Ready to analyze</p>
                  <p className="text-sm mt-1 max-w-xs mx-auto">Provide a resume or job description, and we'll recommend the best interview settings for you.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Review & Edit */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <RotateCcw className="text-blue-600" size={24} /> 
            2. Review & Edit
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Role */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-700">Target Role <span className="text-rose-500">*</span></label>
                {analysisResult && (
                  <span className={`text-xs font-bold ${isRecommended('role', formData.role) ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {isRecommended('role', formData.role) ? '✨ Recommended' : '✎ Your choice'}
                  </span>
                )}
              </div>
              <input 
                type="text" 
                required
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                placeholder="e.g. Frontend Engineer"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-700">Target Company <span className="text-rose-500">*</span></label>
                {analysisResult && (
                  <span className={`text-xs font-bold ${isRecommended('company', formData.company) ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {isRecommended('company', formData.company) ? '✨ Recommended' : '✎ Your choice'}
                  </span>
                )}
              </div>
              <input 
                type="text" 
                required
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                placeholder="e.g. Google, Stripe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-700">Interview Type</label>
                {analysisResult && (
                  <span className={`text-xs font-bold ${isRecommended('recommendedInterviewType', formData.interviewType) ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {isRecommended('recommendedInterviewType', formData.interviewType) ? '✨ Recommended' : '✎ Your choice'}
                  </span>
                )}
              </div>
              <select 
                value={formData.interviewType}
                onChange={e => setFormData({...formData, interviewType: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Mixed">Mixed</option>
                <option value="MCQ">MCQ Interview</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-700">Experience Level</label>
                {analysisResult && (
                  <span className={`text-xs font-bold ${isRecommended('experienceLevel', formData.experienceLevel) ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {isRecommended('experienceLevel', formData.experienceLevel) ? '✨ Recommended' : '✎ Your choice'}
                  </span>
                )}
              </div>
              <select 
                value={formData.experienceLevel}
                onChange={e => setFormData({...formData, experienceLevel: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior (1-3 yrs)</option>
                <option value="Mid">Mid (3-5 yrs)</option>
                <option value="Senior">Senior (5+ yrs)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-700">Difficulty Level</label>
                {analysisResult && (
                  <span className={`text-xs font-bold ${isRecommended('recommendedDifficulty', formData.difficulty) ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {isRecommended('recommendedDifficulty', formData.difficulty) ? '✨ Recommended' : '✎ Your choice'}
                  </span>
                )}
              </div>
              <select 
                value={formData.difficulty}
                onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-slate-700">Number of Questions: {formData.totalQuestions}</label>
                {analysisResult && (
                  <span className={`text-xs font-bold ${isRecommended('recommendedQuestionCount', formData.totalQuestions) ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {isRecommended('recommendedQuestionCount', formData.totalQuestions) ? '✨ Recommended' : '✎ Your choice'}
                  </span>
                )}
              </div>
              <input 
                type="range"
                min="3"
                max="10"
                step="1"
                value={formData.totalQuestions}
                onChange={e => setFormData({...formData, totalQuestions: parseInt(e.target.value)})}
                className="w-full mt-2 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>3 Qs</span>
                <span>10 Qs</span>
              </div>
            </div>

          </div>

          {/* Setup Summary Panel before generation */}
          {analysisResult && (
            <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Setup Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Role</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{formData.role || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Type</span>
                  <span className="font-semibold text-slate-800">{formData.interviewType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Difficulty</span>
                  <span className="font-semibold text-slate-800">{formData.difficulty}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Questions</span>
                  <span className="font-semibold text-slate-800">{formData.totalQuestions}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button 
              type="button"
              onClick={handleReset}
              className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Reset
            </button>
            <button 
              type="submit"
              disabled={creatingInterview || generating || !user?.id}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating || creatingInterview ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {generating ? 'Generating AI Questions...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Play size={18} />
                  Generate Interview
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Generate;
