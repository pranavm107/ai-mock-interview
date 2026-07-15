import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '../components/dashboard/PageHeader';
import { motion } from 'framer-motion';
import { useInterview } from '../hooks/useInterview';
import { useResume } from '../hooks/useResume';
import { generateInterviewSlug } from '../utils/slugHelper';
import type { InterviewType, InterviewDifficulty, ExperienceLevel } from '../types';

const Generate: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { createInterview, loading: creatingInterview } = useInterview();
  const { resumes, loading: loadingResumes } = useResume();

  const [formData, setFormData] = useState({
    resumeId: '',
    company: '',
    role: '',
    interviewType: 'Technical' as InterviewType,
    difficulty: 'Medium' as InterviewDifficulty,
    experienceLevel: 'Mid' as ExperienceLevel,
    language: 'English',
    duration: 30,
    totalQuestions: 5,
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
    setError(null);
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
      
      // 1. Generate real questions from the backend
      const response = await fetch('http://localhost:3001/api/interviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          resumeId: formData.resumeId || null,
          company: formData.company,
          role: formData.role,
          interviewType: formData.interviewType,
          difficulty: formData.difficulty,
          experience: formData.experienceLevel,
          language: formData.language,
          questionCount: formData.totalQuestions,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate questions from AI.');
      }

      const generatedQuestions = await response.json();

      const questionsToSave = generatedQuestions.map((q: any, i: number) => ({
        order: i + 1,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        userAnswer: '',
        aiFeedback: '',
        aiScore: 0,
        answered: false,
        skipped: false,
        duration: 0,
      }));

      // 2. Create Firestore Interview & Save questions
      const newInterview = await createInterview(
        user.id,
        {
          resumeId: formData.resumeId || null,
          title: `${formData.role} at ${formData.company}`,
          company: formData.company,
          role: formData.role,
          interviewType: formData.interviewType,
          difficulty: formData.difficulty,
          experienceLevel: formData.experienceLevel,
          language: formData.language,
          duration: formData.duration,
          totalQuestions: formData.totalQuestions,
          aiProvider: 'Gemini',
          feedbackId: null
        },
        questionsToSave
      );

      // 3. Navigate to Interview Session using slug
      const slug = generateInterviewSlug(newInterview);
      navigate(`/interview/${slug}`);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHeader 
        title="Generate Mock Interview" 
        description="Configure your tailored mock interview session. The AI will craft questions based on your profile, role, and requirements."
        icon={Sparkles}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="max-w-4xl bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
      >
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Target Role <span className="text-rose-500">*</span></label>
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
              <label className="text-sm font-semibold text-slate-700">Target Company <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                placeholder="e.g. Google, Stripe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Resume Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select Resume context (Optional)</label>
              <select 
                value={formData.resumeId}
                onChange={e => setFormData({...formData, resumeId: e.target.value})}
                disabled={loadingResumes || resumes.length === 0}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">No Resume Context</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title || r.fileName}</option>
                ))}
              </select>
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Interview Type</label>
              <select 
                value={formData.interviewType}
                onChange={e => setFormData({...formData, interviewType: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Difficulty Level</label>
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

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Experience Level</label>
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

            {/* Number of Questions */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Number of Questions: {formData.totalQuestions}</label>
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

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Target Duration (Mins): {formData.duration}</label>
              <input 
                type="range"
                min="15"
                max="60"
                step="15"
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                className="w-full mt-2 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>15m</span>
                <span>60m</span>
              </div>
            </div>

          </div>

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
