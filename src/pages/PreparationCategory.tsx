import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/dashboard/PageHeader';
import { BookOpen, ArrowLeft, Settings2, Play, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResume } from '../hooks/useResume';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config/api';

const TOPIC_MAP: Record<string, string[]> = {
  'aptitude': [
    'Percentages', 'Ratio and Proportion', 'Profit and Loss',
    'Time and Work', 'Time, Speed and Distance', 'Probability', 'Number Series'
  ],
  'technical-mcqs': [
    'Python', 'Object-Oriented Programming', 'SQL', 'DBMS',
    'Operating Systems', 'Computer Networks', 'Data Structures and Algorithms', 'AI/ML Fundamentals'
  ],
  'verbal-ability': [
    'Grammar', 'Vocabulary', 'Sentence Correction', 'Reading Comprehension'
  ],
  'logical-reasoning': [
    'Coding-Decoding', 'Syllogisms', 'Directions', 'Seating Arrangement',
    'Patterns and Series', 'Logical Puzzles'
  ]
};

export const PreparationCategory: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { resumes, loading: loadingResumes } = useResume();
  const { getToken } = useAuth();

  // Validate category slug
  const validCategories = ['aptitude', 'technical-mcqs', 'verbal-ability', 'logical-reasoning', 'resume-based-mcqs'];
  const isValidCategory = category && validCategories.includes(category);
  const title = category?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Category';

  const topics = TOPIC_MAP[category || ''] || [];
  const isResumeBased = category === 'resume-based-mcqs';

  const [formData, setFormData] = useState({
    topic: topics.length > 0 ? topics[0] : '',
    resumeId: '',
    difficulty: 'Medium',
    questionCount: 10,
    mode: 'Practice Mode'
  });

  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isResumeBased && !formData.resumeId) {
      setError("Please select a resume to continue.");
      return;
    }

    if (!isResumeBased && !formData.topic) {
      setError("Please select a topic to continue.");
      return;
    }

    // Phase P2: Show summary placeholder
    setSummary({
      ...formData,
      categoryTitle: title,
      durationMinutes: formData.mode === 'Timed Test' ? formData.questionCount * 1.5 : null
    });
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const token = await getToken();

      let endpoint = '';
      let body: any = {};

      if (isResumeBased) {
        endpoint = `${API_BASE_URL}/api/assessments/resume/generate`;
        body = { resumeId: summary.resumeId };
      } else {
        endpoint = `${API_BASE_URL}/api/assessments/placement/generate`;
        body = {
          categorySlug: category,
          topic: summary.topic,
          difficulty: summary.difficulty.toUpperCase(),
          questionCount: summary.questionCount,
          mode: summary.mode === 'Timed Test' ? 'TIMED' : 'PRACTICE'
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate assessment');
      }

      // Navigate to P4 placeholder runtime
      navigate(`/preparation/assessment/${data.data.id}`);

    } catch (err: any) {
      setError(err.message || 'An error occurred during generation');
    } finally {
      setGenerating(false);
    }
  };

  if (!isValidCategory) {
    return (
      <div className="pb-24">
        <Link to="/preparation" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Preparation
        </Link>
        <div className="text-center mt-20">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Category Not Found</h2>
          <p className="text-slate-600">The selected preparation category does not exist.</p>
        </div>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="pb-24">
        <Link to="#" onClick={() => setSummary(null)} className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Configuration
        </Link>
        <PageHeader 
          title={`Starting ${summary.categoryTitle}`} 
          description="Review your configuration before generating the assessment."
          icon={Play}
        />
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
        >
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <h3 className="font-bold text-lg mb-6 flex items-center"><Settings2 className="mr-2 text-blue-600" size={20}/> Configuration Summary</h3>
          <ul className="space-y-4 mb-8">
            <li className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600 font-medium">Mode</span>
              <span className="font-bold text-slate-900">{summary.mode}</span>
            </li>
            {isResumeBased ? (
              <li className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Selected Resume</span>
                <span className="font-bold text-slate-900">{resumes.find(r => r.id === summary.resumeId)?.metadata?.title || 'Selected'}</span>
              </li>
            ) : (
              <li className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 font-medium">Topic</span>
                <span className="font-bold text-slate-900">{summary.topic}</span>
              </li>
            )}
            <li className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600 font-medium">Difficulty</span>
              <span className="font-bold text-slate-900">{summary.difficulty}</span>
            </li>
            <li className="flex justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-600 font-medium">Question Count</span>
              <span className="font-bold text-slate-900">{summary.questionCount} Questions</span>
            </li>
            {summary.durationMinutes && (
              <li className="flex justify-between p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-100">
                <span className="font-medium">Planned Duration</span>
                <span className="font-bold">{summary.durationMinutes} Minutes</span>
              </li>
            )}
          </ul>
          <div className="flex gap-4">
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-sm transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Assessment'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Link to="/preparation" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Back to Preparation
      </Link>
      
      <PageHeader 
        title={title} 
        description="Configure your practice session or timed assessment."
        icon={BookOpen}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
      >
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleContinue} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Topic or Resume Selection */}
            <div className="space-y-2 md:col-span-2">
              {isResumeBased ? (
                <>
                  <label className="text-sm font-semibold text-slate-700">Select Resume <span className="text-rose-500">*</span></label>
                  <p className="text-xs text-slate-500 mb-2">Your personalized assessment will be built dynamically using skills and experiences extracted from this resume.</p>
                  <select 
                    value={formData.resumeId}
                    onChange={e => setFormData({...formData, resumeId: e.target.value})}
                    disabled={loadingResumes || resumes.length === 0}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose a resume...</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.metadata?.title || r.metadata?.fileName || r.id}</option>
                    ))}
                  </select>
                  {resumes.length === 0 && !loadingResumes && (
                    <div className="mt-2 text-sm text-amber-600 flex items-center">
                      <AlertCircle size={14} className="mr-1"/> You have no resumes. Please upload one in the Resume Manager.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <label className="text-sm font-semibold text-slate-700">Topic <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.topic}
                    onChange={e => setFormData({...formData, topic: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Difficulty</label>
              <select 
                value={formData.difficulty}
                onChange={e => setFormData({...formData, difficulty: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Question Count</label>
              <select 
                value={formData.questionCount}
                onChange={e => setFormData({...formData, questionCount: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            {/* Mode Selection */}
            <div className="space-y-3 md:col-span-2 mt-2">
              <label className="text-sm font-semibold text-slate-700">Preparation Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div 
                  onClick={() => setFormData({...formData, mode: 'Practice Mode'})}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.mode === 'Practice Mode' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.mode === 'Practice Mode' ? 'border-blue-600' : 'border-slate-300'}`}>
                      {formData.mode === 'Practice Mode' && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                    <span className={`font-bold ${formData.mode === 'Practice Mode' ? 'text-blue-900' : 'text-slate-700'}`}>Practice Mode</span>
                  </div>
                  <p className="text-sm text-slate-500 ml-6">Untimed session. Best for learning and reviewing explanations.</p>
                </div>

                <div 
                  onClick={() => setFormData({...formData, mode: 'Timed Test'})}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.mode === 'Timed Test' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.mode === 'Timed Test' ? 'border-blue-600' : 'border-slate-300'}`}>
                      {formData.mode === 'Timed Test' && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                    <span className={`font-bold ${formData.mode === 'Timed Test' ? 'text-blue-900' : 'text-slate-700'}`}>Timed Test</span>
                  </div>
                  <p className="text-sm text-slate-500 ml-6">Simulates a real assessment with a strict countdown timer.</p>
                </div>

              </div>
            </div>

          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-sm transition-all flex items-center"
            >
              Continue <ArrowLeft size={18} className="ml-2 rotate-180" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
