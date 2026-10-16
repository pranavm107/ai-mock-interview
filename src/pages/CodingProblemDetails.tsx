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
    <div className="max-w-4xl mx-auto flex flex-col gap-4 pb-10">
      <button 
        onClick={() => navigate('/coding')}
        className="self-start flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} /> Back to Practice
      </button>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.estimatedMinutes && (
              <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                <Clock size={13} /> {problem.estimatedMinutes} min
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{problem.title}</h1>
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {problem.topics.map(topic => (
              <span key={topic} className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                <Hash size={11} /> {topic}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">{problem.description}</p>
          </div>

          {problem.examples && problem.examples.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide text-xs text-slate-400">Examples</h3>
              <div className="flex flex-col gap-3">
                {problem.examples.map((ex, index) => (
                  <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 font-mono text-xs sm:text-sm">
                    <div className="mb-1.5"><strong className="text-slate-900 font-sans">Input:</strong> <span className="text-blue-700 ml-1">{ex.input}</span></div>
                    <div className="mb-1.5"><strong className="text-slate-900 font-sans">Output:</strong> <span className="text-emerald-700 ml-1">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="mt-1 pt-1 border-t border-slate-200"><strong className="text-slate-900 font-sans">Explanation:</strong> <span className="text-slate-600 font-sans ml-1">{ex.explanation}</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.constraints && problem.constraints.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Constraints</h3>
              <ul className="list-disc pl-4 flex flex-col gap-1.5">
                {problem.constraints.map((constraint, i) => (
                  <li key={i} className="text-slate-700 font-mono text-xs bg-slate-100 inline-block px-2 py-0.5 rounded w-fit border border-slate-200">
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end sticky bottom-4 z-10">
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            navigate(`/coding/problem/${problem.slug}/workspace`);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-500 transition-all"
        >
          <Code2 size={16} />
          Start Coding
        </motion.button>
      </div>
    </div>
  );
};

export default CodingProblemDetails;
