import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { codingFrontendService } from '../services/codingFrontendService';
import type { CodingProblem } from '../types/coding';
import { ArrowLeft, Clock, Code2, Hash, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const colors = {
    EASY: 'bg-green-100 text-green-700 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    HARD: 'bg-red-100 text-red-700 border-red-200'
  };
  const color = colors[difficulty as keyof typeof colors] || colors.EASY;
  const label = difficulty.charAt(0) + difficulty.slice(1).toLowerCase();

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
};

const CodingProblemDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("No auth token available");
        if (!slug) throw new Error("No slug provided");

        const data = await codingFrontendService.getProblemBySlug(token, slug);
        setProblem(data);
      } catch (err: any) {
        console.error(err);
        setError("Could not load the problem details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug, getToken]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto p-6 animate-pulse">
        <div className="h-12 w-32 bg-slate-200 rounded-lg mb-6"></div>
        <div className="h-24 bg-slate-200 rounded-2xl w-full mb-6"></div>
        <div className="h-64 bg-slate-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Problem Not Found</h2>
        <p className="text-slate-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/coding')}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      <button 
        onClick={() => navigate('/coding')}
        className="self-start flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
      >
        <ArrowLeft size={18} /> Back to Practice
      </button>

      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.estimatedMinutes && (
              <span className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                <Clock size={16} /> {problem.estimatedMinutes} min
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{problem.title}</h1>
          <div className="flex flex-wrap gap-2 mt-1">
            {problem.topics.map(topic => (
              <span key={topic} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                <Hash size={12} /> {topic}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-8 flex flex-col gap-8">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">{problem.description}</p>
          </div>

          {problem.examples && problem.examples.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-slate-900">Examples</h3>
              <div className="flex flex-col gap-4">
                {problem.examples.map((ex, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-sm">
                    <div className="mb-2"><strong className="text-slate-900 font-sans">Input:</strong> <span className="text-blue-700">{ex.input}</span></div>
                    <div className="mb-2"><strong className="text-slate-900 font-sans">Output:</strong> <span className="text-green-700">{ex.output}</span></div>
                    {ex.explanation && (
                      <div><strong className="text-slate-900 font-sans">Explanation:</strong> <span className="text-slate-600 font-sans">{ex.explanation}</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.constraints && problem.constraints.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-slate-900">Constraints</h3>
              <ul className="list-disc pl-5 flex flex-col gap-2">
                {problem.constraints.map((constraint, i) => (
                  <li key={i} className="text-slate-700 font-mono text-sm bg-slate-100 inline-block px-2 py-0.5 rounded-md w-fit border border-slate-200">
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end sticky bottom-6 z-10">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            navigate(`/coding/problem/${problem.slug}/workspace`);
          }}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all"
        >
          <Code2 size={24} />
          Start Coding
        </motion.button>
      </div>
    </div>
  );
};

export default CodingProblemDetails;
