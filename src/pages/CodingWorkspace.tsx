import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Editor from '@monaco-editor/react';
import { codingFrontendService } from '../services/codingFrontendService';
import type { CodingProblem } from '../types/coding';
import { ArrowLeft, Play, Send, RefreshCcw, Loader2, AlertCircle, CheckCircle2, ChevronDown, Code2, Beaker, XCircle, Shield, ShieldAlert, LogOut } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getDefaultLanguage } from '../config/codingLanguages';
import type { CodingLanguage } from '../config/codingLanguages';
import { motion, AnimatePresence } from 'framer-motion';
import type { SubmissionResult, TestCaseResult } from '../types/evaluation';
import type { CodingSessionMode, CodingIntegrityState, IntegritySignal, CodingEnforcementState, ServerIntegritySession, AIAnalysisResult } from '../types/coding';
import { createIntegrityDetector, IntegrityDetectionService } from '../services/coding/integrityDetectionService';
import { createServerIntegritySession, getServerIntegritySession, processServerIntegritySignal, endServerIntegritySession, heartbeatServerIntegritySession } from '../services/coding/integrityApiService';

const DifficultyBadge: React.FC<{ difficulty: string }> = ({ difficulty }) => {
  const colors = {
    EASY: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HARD: 'bg-red-100 text-red-700'
  };
  const color = colors[difficulty as keyof typeof colors] || colors.EASY;
  const label = difficulty.charAt(0) + difficulty.slice(1).toLowerCase();

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>
      {label}
    </span>
  );
};

const CodingWorkspace: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLanguage, setActiveLanguage] = useState<CodingLanguage>(getDefaultLanguage());
  const [code, setCode] = useState<string>(activeLanguage.starterCode);
  
  // States for placeholder execution
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputState, setOutputState] = useState<'IDLE' | 'RUNNING' | 'FINISHED' | 'EVALUATED'>('IDLE');
  const [outputMessage, setOutputMessage] = useState<string>('Run your code to see the output here.');
  const [evaluationResult, setEvaluationResult] = useState<SubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'TESTS' | 'AI_ANALYSIS'>('CONSOLE');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Integrity Session State
  const [sessionMode, setSessionMode] = useState<CodingSessionMode>('PRACTICE');
  const [integrityState, setIntegrityState] = useState<CodingIntegrityState>('INACTIVE');
  const [consentChecked, setConsentChecked] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [integritySignals, setIntegritySignals] = useState<IntegritySignal[]>([]);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const detectorRef = useRef<IntegrityDetectionService | null>(null);
  const [enforcementState, setEnforcementState] = useState<CodingEnforcementState>('ACTIVE');
  const [serverSession, setServerSession] = useState<ServerIntegritySession | null>(null);
  const [currentWarningMsg, setCurrentWarningMsg] = useState<string>('');
  const [conflictSessionId, setConflictSessionId] = useState<string | null>(null);
  const analysisRequestIdRef = useRef<number>(0);
  const evaluationRequestIdRef = useRef<number>(0);
  const [evaluationType, setEvaluationType] = useState<'RUN_TESTS' | 'SUBMIT' | null>(null);

  const mapSignalToWarningMsg = (signalType: string) => {
    switch (signalType) {
      case 'TAB_SWITCH': return 'Browser tab visibility changed.';
      case 'WINDOW_BLUR': return 'The coding window lost focus.';
      case 'FULLSCREEN_EXIT': return 'Fullscreen mode was exited.';
      case 'NAVIGATION_ATTEMPT': return 'A navigation attempt was detected.';
      default: return 'An unexpected browser event was detected.';
    }
  };

  // Fullscreen sync and detector lifecycle
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // User exited fullscreen manually
        if (integrityState === 'ACTIVE') {
          // Handled by detector for FULLSCREEN_EXIT signal
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [integrityState]);

  useEffect(() => {
    if (integrityState === 'ACTIVE' && sessionId) {
      if (!detectorRef.current) {
        detectorRef.current = createIntegrityDetector({
          sessionId,
          onSignal: async (signal) => {
            setIntegritySignals(prev => [...prev, signal]);
            
            // Process the signal through C9 Server Strike Engine
            try {
              const token = await getToken();
              if (!token || !sessionId) return;
              
              const res = await processServerIntegritySignal(sessionId, signal.id, signal.type, token, signal.timestamp, signal.metadata);
              if (res.signalAccepted && !res.duplicate) {
                const s = res.session;
                setServerSession(s);
                setCurrentWarningMsg(mapSignalToWarningMsg(signal.type));

                if (s.status === 'TERMINATED') {
                  setEnforcementState('TERMINATED');
                  // Exit fullscreen
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(console.error);
                  }
                  // Stop detection
                  detectorRef.current?.stop();
                  setIntegrityState('ENDED');
                } else if (s.strikeCount === 1) {
                  setEnforcementState('WARNING');
                } else if (s.strikeCount === 2) {
                  setEnforcementState('FINAL_WARNING');
                }
              }
            } catch (err) {
              console.error('Failed to report integrity signal', err);
            }
          }
        });
      }
      if (enforcementState !== 'TERMINATED') {
        detectorRef.current.start();
      }
    } else {
      if (detectorRef.current) {
        detectorRef.current.stop();
        // Keep detectorRef attached so we don't lose context, or set to null
        // If state is ENDED or INACTIVE, maybe we clean it up entirely.
        if (integrityState === 'INACTIVE' || integrityState === 'ENDED') {
           detectorRef.current = null;
        }
      }
    }

    return () => {
      if (detectorRef.current) {
        detectorRef.current.stop();
      }
    };
  }, [integrityState, sessionId]);

  // C16 Heartbeat lifecycle
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let isHeartbeating = false;
    let isActive = true;

    if (integrityState === 'ACTIVE' && sessionId) {
      intervalId = setInterval(async () => {
        if (isHeartbeating) return; // Prevent overlapping
        isHeartbeating = true;
        try {
          const token = await getToken();
          if (token && isActive) {
            const s = await heartbeatServerIntegritySession(sessionId, token);
            if (isActive) {
              setServerSession(s);
            }
          }
        } catch (e) {
          // Network errors or inactive session shouldn't kill the UI directly in C16
          console.error('Heartbeat failed', e);
        } finally {
          isHeartbeating = false;
        }
      }, 30000); // 30 seconds
    }

    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [integrityState, sessionId, getToken]);

  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('coding-workspace-split');
    return saved ? parseInt(saved, 10) : 45;
  });
  const [topHeight, setTopHeight] = useState(() => {
    const saved = localStorage.getItem('coding-workspace-vsplit');
    return saved ? parseInt(saved, 10) : 65;
  });

  const isResizing = useRef(false);
  const isVResizing = useRef(false);

  useEffect(() => {
    localStorage.setItem('coding-workspace-split', leftWidth.toString());
  }, [leftWidth]);

  useEffect(() => {
    localStorage.setItem('coding-workspace-vsplit', topHeight.toString());
  }, [topHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newLeftWidth = (e.clientX / window.innerWidth) * 100;
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleVMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isVResizing.current = true;
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleVMouseMove);
    document.addEventListener('mouseup', handleVMouseUp);
  };

  const handleVMouseMove = (e: MouseEvent) => {
    if (!isVResizing.current) return;
    const newTopHeight = (e.clientY / window.innerHeight) * 100;
    if (newTopHeight >= 30 && newTopHeight <= 85) {
      setTopHeight(newTopHeight);
    }
  };

  const handleVMouseUp = () => {
    isVResizing.current = false;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleVMouseMove);
    document.removeEventListener('mouseup', handleVMouseUp);
  };

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('preppilot-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0f172a',
        'editor.lineHighlightBackground': '#1e293b',
      }
    });
  };

  const handleEditorDidMount = (editor: any) => {
    editor.onDidPaste(() => {
      // If the session is active, the detector will exist and process it
      detectorRef.current?.reportEditorPaste();
    });

    editor.onDidChangeModelContent((e: any) => {
      if (!detectorRef.current) return;
      let isBulkInsert = false;
      let maxLen = 0;
      
      for (const change of e.changes) {
        if (change.text && change.text.length > 50) { // 50+ chars is a bulk insertion
          isBulkInsert = true;
          maxLen = Math.max(maxLen, change.text.length);
        }
      }

      if (isBulkInsert) {
        detectorRef.current.reportLargeInsertion(maxLen);
      }
    });
  };

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

  // Handle language switch and draft state locally
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langId = e.target.value;
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === langId);
    if (lang) {
      setActiveLanguage(lang);
      // For C3, simply replace with starter code. Real app might persist drafts per language.
      setCode(lang.starterCode);
      setOutputState('IDLE');
      setOutputMessage('Run your code to see the output here.');
    }
  };

  const handleReset = () => {
    if (enforcementState === 'TERMINATED') return;
    if (window.confirm('Are you sure you want to reset the code? Your current progress will be lost.')) {
      setCode(activeLanguage.starterCode);
      setOutputState('IDLE');
      setOutputMessage('Run your code to see the output here.');
    }
  };

  const handleRunCode = async () => {
    if (enforcementState === 'TERMINATED') return;
    setIsExecuting(true);
    setOutputState('RUNNING');
    setOutputMessage('Running...');
    setActiveTab('CONSOLE');
    
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");
      
      const result = await codingFrontendService.executeCode(token, {
        language: activeLanguage.id,
        sourceCode: code,
        stdin: '', // No stdin support in UI yet, but API accepts it
        sessionId: integrityState === 'ACTIVE' && sessionId ? sessionId : undefined
      });

      setOutputState('FINISHED');
      if (result.status === 'SANDBOX_UNAVAILABLE') {
        setOutputMessage(result.stderr || 'Secure code execution is temporarily unavailable.');
      } else if (result.status === 'UNSUPPORTED_LANGUAGE') {
        setOutputMessage(result.stderr || 'Execution unavailable for this language.');
      } else if (result.status === 'COMPLETED') {
        setOutputMessage(result.stdout || 'Program exited with no output.');
      } else if (result.status === 'TIMEOUT') {
        setOutputMessage('Execution timed out.');
      } else if (result.status === 'MEMORY_LIMIT') {
        setOutputMessage('Memory limit exceeded.');
      } else if (result.status === 'OUTPUT_LIMIT') {
        setOutputMessage('Output limit exceeded.');
      } else if (result.status === 'RUNTIME_ERROR' || result.status === 'COMPILE_ERROR') {
        setOutputMessage(result.stderr || 'Runtime error occurred.');
      } else {
        setOutputMessage(result.stdout || result.stderr || 'Execution completed with unknown status.');
      }
    } catch (err: any) {
      setOutputState('FINISHED');
      setOutputMessage(err.message || 'An error occurred while executing the code.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunTests = async () => {
    if (enforcementState === 'TERMINATED') return;
    if (!slug) return;
    setIsExecuting(true);
    setOutputState('RUNNING');
    setOutputMessage('Running public tests...');
    setActiveTab('TESTS');
    setEvaluationResult(null);
    setEvaluationType('RUN_TESTS');
    
    const currentRequestId = ++evaluationRequestIdRef.current;

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");
      
      const result = await codingFrontendService.runTests(
        token, 
        slug, 
        code, 
        activeLanguage.id,
        integrityState === 'ACTIVE' && sessionId ? sessionId : undefined
      );
      
      if (evaluationRequestIdRef.current === currentRequestId) {
        setEvaluationResult(result);
        setOutputState('EVALUATED');
      }
    } catch (err: any) {
      if (evaluationRequestIdRef.current === currentRequestId) {
        setOutputState('FINISHED');
        setOutputMessage(err.message || 'An error occurred while running tests.');
      }
    } finally {
      if (evaluationRequestIdRef.current === currentRequestId) {
        setIsExecuting(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (enforcementState === 'TERMINATED') return;
    if (!slug) return;
    setIsExecuting(true);
    setOutputState('RUNNING');
    setOutputMessage('Evaluating submission...');
    setActiveTab('TESTS');
    setEvaluationResult(null);
    setEvaluationType('SUBMIT');
    
    const currentRequestId = ++evaluationRequestIdRef.current;

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");
      
      const result = await codingFrontendService.submitCode(
        token, 
        slug, 
        code, 
        activeLanguage.id,
        integrityState === 'ACTIVE' && sessionId ? sessionId : undefined
      );
      
      if (evaluationRequestIdRef.current === currentRequestId) {
        setEvaluationResult(result);
        setOutputState('EVALUATED');
      }
    } catch (err: any) {
      if (evaluationRequestIdRef.current === currentRequestId) {
        setOutputState('FINISHED');
        setOutputMessage(err.message || 'An error occurred while evaluating the submission.');
      }
    } finally {
      if (evaluationRequestIdRef.current === currentRequestId) {
        setIsExecuting(false);
      }
    }
  };

  const handleAnalyzeCode = async () => {
    if (enforcementState === 'TERMINATED') return;
    if (!slug) return;
    setIsAnalyzing(true);
    setAiAnalysis(null);
    setAiError(null);
    setActiveTab('AI_ANALYSIS');
    
    const currentRequestId = ++analysisRequestIdRef.current;

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");
      
      const result = await codingFrontendService.analyzeCode(
        token, 
        slug, 
        code, 
        activeLanguage.id,
        integrityState === 'ACTIVE' && sessionId ? sessionId : undefined
      );
      
      if (analysisRequestIdRef.current === currentRequestId) {
        setAiAnalysis(result);
      }
    } catch (err: any) {
      if (analysisRequestIdRef.current === currentRequestId) {
        setAiError(err.message || 'An error occurred while analyzing the code.');
      }
    } finally {
      if (analysisRequestIdRef.current === currentRequestId) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleStartIntegrityFlow = () => {
    setIntegrityState('CONSENT_REQUIRED');
    setConsentChecked(false);
    setFullscreenError(null);
    setIntegritySignals([]); // clear old debug signals if any
    setEnforcementState('ACTIVE');
    setServerSession(null);
    setSessionId(null);
    setConflictSessionId(null);
  };

  const handleConfirmIntegritySession = async () => {
    if (!consentChecked) return;
    if (!slug) return;
    setIntegrityState('STARTING');
    setFullscreenError(null);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication failed");

      if (document.fullscreenEnabled && workspaceRef.current) {
        await workspaceRef.current.requestFullscreen();
        
        // Wait for fullscreen then hit server
        const session = await createServerIntegritySession(slug, activeLanguage.id, token);
        setSessionId(session.sessionId);
        setServerSession(session);
        setSessionMode('INTEGRITY');
        setIntegrityState('ACTIVE');
      } else {
        throw new Error('Fullscreen API not supported');
      }
    } catch (err: any) {
      console.error(err);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
      
      if (err.message === 'ACTIVE_SESSION_CONFLICT') {
        setConflictSessionId(err.existingSessionId || null);
        setIntegrityState('CONFLICT' as any);
      } else {
        setIntegrityState('CONSENT_REQUIRED'); // revert back so they can see the error
        setFullscreenError(err.message || 'Unable to enter fullscreen or create session. Please try again.');
      }
    }
  };

  const handleResolveConflictEndSession = async () => {
    if (conflictSessionId) {
      try {
        const token = await getToken();
        if (token) {
          await endServerIntegritySession(conflictSessionId, token);
        }
      } catch (e) {
        console.error('Failed to end conflicting session', e);
      }
    }
    // Now try to start the session again
    setConflictSessionId(null);
    handleConfirmIntegritySession();
  };

  const handleCancelIntegrityFlow = () => {
    setIntegrityState('INACTIVE');
    setFullscreenError(null);
  };

  const handleEndIntegritySession = () => {
    setIntegrityState('ENDING');
  };

  const handleConfirmEndSession = async () => {
    if (sessionId) {
      try {
        const token = await getToken();
        if (token) {
          await endServerIntegritySession(sessionId, token);
        }
      } catch (e) {
        console.error('Failed to end session on server', e);
      }
    }

    setIntegrityState('ENDED');
    setSessionMode('PRACTICE');
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
    
    setTimeout(() => {
      setIntegrityState('INACTIVE');
      setEnforcementState('ACTIVE');
      setServerSession(null);
      setSessionId(null);
    }, 500);
  };

  const handleCancelEndSession = () => {
    setIntegrityState('ACTIVE');
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-950 text-white">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Problem Not Found</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/coding')}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div ref={workspaceRef} className="h-screen md:h-[calc(100vh-80px)] bg-slate-950 flex flex-col overflow-hidden text-slate-300 relative">
      
      {/* GLOBAL WORKSPACE HEADER */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 bg-slate-900 z-10 w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/coding/problem/${slug}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-4 w-px bg-slate-700 hidden md:block"></div>
          <h2 className="text-white font-medium text-sm hidden md:block">{problem.title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeLanguage.id}
              onChange={handleLanguageChange}
              disabled={enforcementState === 'TERMINATED'}
              className="appearance-none bg-slate-800 text-sm font-medium text-white px-4 py-1.5 pr-8 rounded border border-slate-700 outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={handleReset}
            disabled={enforcementState === 'TERMINATED'}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors p-2 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset to initial starter code"
          >
            <RefreshCcw size={14} /> Reset
          </button>

          {/* INTEGRITY MODE ENTRY */}
          {integrityState === 'INACTIVE' && (
            <button
              onClick={handleStartIntegrityFlow}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 text-sm font-medium rounded transition-colors ml-2"
            >
              <Shield size={14} />
              Start Integrity Mode
            </button>
          )}
          {integrityState === 'ACTIVE' && (
            <button
              onClick={handleEndIntegritySession}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white text-sm font-medium rounded transition-colors ml-2"
            >
              <LogOut size={14} />
              End Session
            </button>
          )}
        </div>
      </div>

      {integrityState === 'ACTIVE' && (
        <div className="h-8 bg-indigo-950/80 border-b border-indigo-900/50 flex items-center justify-between px-4 text-indigo-300 text-xs font-medium shrink-0">
          <div className="flex items-center">
            <Shield size={12} className="mr-2" />
            ● Integrity Mode Active
          </div>
          {import.meta.env.DEV && (
            <div className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-indigo-900">
              Dev Diagnostic: {integritySignals.length} signals
            </div>
          )}
        </div>
      )}

      {integrityState === 'CONFLICT' && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 p-8 rounded-xl max-w-md w-full border border-slate-800 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert size={32} className="text-red-500" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-4">Active Session Conflict</h2>
            
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700 w-full text-left">
              <p className="text-slate-300 text-sm">
                You already have an active coding session running in another tab or window. Our platform requires that you only have one protected session active at a time.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={handleResolveConflictEndSession}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> End Old Session & Continue Here
              </button>
              
              <button 
                onClick={handleCancelIntegrityFlow}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* DEVELOPMENT DIAGNOSTIC PANEL (Floating) */}
        {integrityState === 'ACTIVE' && import.meta.env.DEV && integritySignals.length > 0 && (
          <div className="absolute top-4 right-4 w-64 max-h-[50%] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-2xl z-20 flex flex-col overflow-hidden pointer-events-none">
            <div className="bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 border-b border-slate-700">
              Development Diagnostics
            </div>
            <div className="p-2 overflow-y-auto space-y-1 text-[10px] font-mono pointer-events-auto custom-scrollbar">
              {integritySignals.map(sig => (
                <div key={sig.id} className="flex flex-col bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="text-yellow-400 font-bold">{sig.type}</span>
                  <span className="text-slate-500">{new Date(sig.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* LEFT PANEL: Problem Details */}
      <div 
        className="w-full md:w-auto h-full flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 shrink-0 transition-none"
        style={{ width: window.innerWidth >= 768 ? `${leftWidth}%` : '100%' }}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="flex items-center gap-3 mb-3">
            <DifficultyBadge difficulty={problem.difficulty} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-6">{problem.title}</h1>
          
          <div className="prose prose-invert max-w-none mb-8 text-slate-300 prose-p:leading-relaxed">
            <p className="whitespace-pre-wrap">{problem.description}</p>
          </div>

          {problem.examples && problem.examples.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Example Test Cases</h2>
              <div className="space-y-4">
                {problem.examples.map((ex, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-800">
                    <div className="mb-2"><strong className="text-slate-400">Input:</strong> <span className="font-mono text-sm text-blue-300">{ex.input}</span></div>
                    <div className="mb-2"><strong className="text-slate-400">Output:</strong> <span className="font-mono text-sm text-emerald-300">{ex.output}</span></div>
                    {ex.explanation && (
                      <div><strong className="text-slate-400">Explanation:</strong> <span className="text-sm">{ex.explanation}</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.constraints && problem.constraints.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Constraints</h2>
              <ul className="list-disc pl-5 space-y-1.5">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="text-slate-300"><code className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-sm">{c}</code></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* SPLITTER (Desktop only) */}
      <div
        className="hidden md:flex w-1.5 hover:w-2 bg-transparent hover:bg-blue-500/50 cursor-col-resize z-10 items-center justify-center -ml-[3px] -mr-[3px] shrink-0 transition-colors focus:outline-none focus:bg-blue-500/50"
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setLeftWidth(prev => Math.max(20, prev - 5));
          else if (e.key === 'ArrowRight') setLeftWidth(prev => Math.min(80, prev + 5));
        }}
        role="separator"
        aria-label="Resize workspace panels"
        tabIndex={0}
        aria-orientation="vertical"
        aria-valuenow={leftWidth}
      >
        <div className="h-8 w-0.5 bg-slate-600 rounded-full" />
      </div>

      {/* RIGHT PANEL: Editor & Output */}
      <div className="w-full flex-1 h-full flex flex-col bg-slate-900 min-w-0">

        {/* Editor Area */}
        <div 
          className="relative w-full flex-shrink-0" 
          style={{ height: window.innerWidth >= 768 ? `${topHeight}%` : '60%' }}
        >
          <Editor
            height="100%"
            language={activeLanguage.monacoLanguage}
            value={code}
            onChange={(val) => setCode(val || '')}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
            theme="preppilot-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              wordWrap: "off",
              tabSize: 4,
              insertSpaces: true,
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true }
            }}
          />
        </div>

      {/* HORIZONTAL SPLITTER (Desktop only) */}
        <div
          className="hidden md:flex h-1.5 hover:h-2 w-full bg-transparent hover:bg-blue-500/50 cursor-row-resize z-10 items-center justify-center shrink-0 transition-colors focus:outline-none focus:bg-blue-500/50"
          onMouseDown={handleVMouseDown}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') setTopHeight(prev => Math.max(30, prev - 5));
            else if (e.key === 'ArrowDown') setTopHeight(prev => Math.min(85, prev + 5));
          }}
          role="separator"
          aria-label="Resize editor and output panels"
          tabIndex={0}
          aria-orientation="horizontal"
          aria-valuenow={topHeight}
        >
          <div className="w-8 h-0.5 bg-slate-600 rounded-full" />
        </div>

        {/* Output Panel Header & Controls */}
        <div className="h-12 border-y border-slate-800 flex items-center justify-between px-2 md:px-4 shrink-0 bg-slate-900 overflow-x-auto custom-scrollbar">
          <div className="flex items-center" role="tablist" aria-label="Output Views">
            <button 
              role="tab"
              aria-selected={activeTab === 'CONSOLE'}
              aria-controls="panel-console"
              id="tab-console"
              onClick={() => setActiveTab('CONSOLE')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'CONSOLE' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              Console
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'TESTS'}
              aria-controls="panel-tests"
              id="tab-tests"
              onClick={() => setActiveTab('TESTS')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'TESTS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              Test Results
            </button>
            <button 
              role="tab"
              aria-selected={activeTab === 'AI_ANALYSIS'}
              aria-controls="panel-ai"
              id="tab-ai"
              onClick={() => setActiveTab('AI_ANALYSIS')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'AI_ANALYSIS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'}`}
            >
              AI Feedback
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={isExecuting || enforcementState === 'TERMINATED' || enforcementState === 'WARNING' || enforcementState === 'FINAL_WARNING'}
              onClick={handleRunCode}
              aria-busy={isExecuting && activeTab === 'CONSOLE'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none"
            >
              {isExecuting && activeTab === 'CONSOLE' ? <Loader2 size={12} className="animate-spin text-emerald-400" /> : <Play size={12} className="text-emerald-400" />}
              Run Code
            </button>
            <button
              disabled={isExecuting || enforcementState === 'TERMINATED' || enforcementState === 'WARNING' || enforcementState === 'FINAL_WARNING'}
              onClick={handleRunTests}
              aria-busy={isExecuting && activeTab === 'TESTS'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:ring-2 focus-visible:ring-blue-400 focus:outline-none"
            >
              {isExecuting && activeTab === 'TESTS' && outputMessage.includes('public') ? <Loader2 size={12} className="animate-spin text-blue-400" /> : <Beaker size={12} className="text-blue-400" />}
              Run Tests
            </button>
            <button
              disabled={isAnalyzing || isExecuting || enforcementState === 'TERMINATED' || enforcementState === 'WARNING' || enforcementState === 'FINAL_WARNING'}
              onClick={handleAnalyzeCode}
              aria-busy={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap focus-visible:ring-2 focus-visible:ring-purple-400 focus:outline-none"
            >
              {isAnalyzing ? <Loader2 size={12} className="animate-spin text-purple-400" /> : <Shield size={12} className="text-purple-400" />}
              AI Feedback
            </button>
            <button
              disabled={isExecuting || enforcementState === 'TERMINATED' || enforcementState === 'WARNING' || enforcementState === 'FINAL_WARNING'}
              onClick={handleSubmit}
              aria-busy={isExecuting && activeTab === 'TESTS' && outputMessage.includes('Evaluat')}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-white focus:outline-none"
            >
              {isExecuting && activeTab === 'TESTS' && outputMessage.includes('Evaluat') ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Submit
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="flex-1 bg-[#09090b] p-4 overflow-y-auto custom-scrollbar font-mono text-sm relative" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (activeTab === 'CONSOLE' ? outputState : '')}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.15 }}
              className="absolute inset-4"
            >
              {activeTab === 'CONSOLE' ? (
                // CONSOLE TAB
                outputState === 'IDLE' ? (
                  <div className="text-slate-500">{outputMessage}</div>
                ) : outputState === 'RUNNING' && !outputMessage.includes('Evaluating') && !outputMessage.includes('public tests') ? (
                  <div className="text-slate-400 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    {outputMessage}
                  </div>
                ) : (outputState === 'FINISHED' || (outputState === 'EVALUATED' && !outputMessage.includes('Evaluating'))) ? (
                  <div className="text-slate-300 whitespace-pre-wrap">
                    {outputMessage}
                  </div>
                ) : (
                  <div className="text-slate-500">Run code to see console output.</div>
                )
              ) : activeTab === 'TESTS' ? (
                // TESTS TAB
                outputState === 'IDLE' ? (
                  <div className="text-slate-500">Run tests or submit to see results here.</div>
                ) : outputState === 'RUNNING' && (outputMessage.includes('Evaluating') || outputMessage.includes('public tests')) ? (
                  <div className="text-slate-400 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-blue-500" />
                    {outputMessage}
                  </div>
                ) : outputState === 'EVALUATED' && evaluationResult ? (
                  <div className="flex flex-col gap-4 pb-8">
                    <div className="text-slate-400 font-medium mb-1 tracking-wide uppercase text-xs">
                      {evaluationType === 'SUBMIT' ? 'Submission Results' : 'Public Test Results'}
                    </div>
                    <div className={`p-4 rounded border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      evaluationResult.status === 'ACCEPTED' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' :
                      evaluationResult.status === 'WRONG_ANSWER' ? 'bg-red-950/30 border-red-900/50 text-red-400' :
                      'bg-yellow-950/30 border-yellow-900/50 text-yellow-400'
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-lg">
                        {evaluationResult.status === 'ACCEPTED' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        {evaluationResult.status === 'ACCEPTED' ? 'Accepted' : 
                         evaluationResult.status === 'WRONG_ANSWER' ? 'Wrong Answer' :
                         evaluationResult.status === 'TIMEOUT' ? 'Time Limit Exceeded' :
                         evaluationResult.status === 'MEMORY_LIMIT_EXCEEDED' ? 'Memory Limit Exceeded' :
                         evaluationResult.status === 'OUTPUT_LIMIT_EXCEEDED' ? 'Output Limit Exceeded' :
                         'Runtime Error'}
                      </div>
                      <div className="text-sm font-medium bg-black/20 px-3 py-1.5 rounded-full flex flex-wrap gap-2 items-center">
                        <span>{evaluationResult.passedTests} / {evaluationResult.totalTests} passed</span>
                        <span className="opacity-50">&bull;</span>
                        <span>Score: {evaluationResult.score}</span>
                        {evaluationResult.executionTimeMs > 0 && (
                          <>
                            <span className="opacity-50">&bull;</span>
                            <span>{evaluationResult.executionTimeMs}ms</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {evaluationResult.testResults.map((tr: TestCaseResult, i: number) => (
                        <div key={tr.testCaseId || i} className={`p-4 rounded border ${tr.status === 'PASSED' ? 'bg-emerald-950/10 border-emerald-900/30' : 'bg-red-950/10 border-red-900/30'}`}>
                          <div className="flex items-center gap-2 font-semibold mb-2 text-slate-300">
                            {tr.status === 'PASSED' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                            {tr.isHidden ? 'Hidden Test Case' : `Test Case ${i + 1}`}
                            <span className={`ml-auto text-xs font-normal px-2 py-0.5 rounded-full ${tr.status === 'PASSED' ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'}`}>
                              {tr.status === 'PASSED' ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          
                          {!tr.isHidden && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                              <div>
                                <div className="text-slate-500 mb-1 font-sans">Input:</div>
                                <div className="bg-slate-900/80 p-2.5 rounded text-slate-300 font-mono whitespace-pre-wrap border border-slate-800">{tr.input}</div>
                              </div>
                              <div>
                                <div className="text-slate-500 mb-1 font-sans">Expected Output:</div>
                                <div className="bg-slate-900/80 p-2.5 rounded text-emerald-300 font-mono whitespace-pre-wrap border border-slate-800">{tr.expectedOutput}</div>
                              </div>
                              {tr.actualOutput !== undefined && (
                                <div className="md:col-span-2">
                                  <div className="text-slate-500 mb-1 font-sans">Actual Output:</div>
                                  <div className={`bg-slate-900/80 p-2.5 rounded font-mono whitespace-pre-wrap border border-slate-800 ${tr.status === 'PASSED' ? 'text-emerald-300' : 'text-red-300'}`}>
                                    {tr.actualOutput || <span className="opacity-50 italic font-sans">No output</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {tr.error && (
                            <div className="mt-3 text-xs">
                              <div className="text-slate-500 mb-1 font-sans">Error:</div>
                              <div className="bg-red-950/20 text-red-400 p-2.5 rounded font-mono whitespace-pre-wrap border border-red-900/30">
                                {tr.error}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500">Run tests or submit to see results here.</div>
                )
              ) : (
                // AI ANALYSIS TAB
                isAnalyzing ? (
                  <div className="text-purple-400 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing code using AI...
                  </div>
                ) : aiError ? (
                  <div className="text-red-400 p-4 rounded bg-red-950/20 border border-red-900/30 whitespace-pre-wrap">
                    {aiError}
                  </div>
                ) : aiAnalysis ? (
                  <div className="flex flex-col gap-6 pb-8 text-sm">
                    <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded text-purple-300 flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <div className="text-xs leading-relaxed">
                        <strong>Advisory Only:</strong> AI feedback is provided as an experimental learning aid. It does not determine your final score, pass/fail status, or integrity standing. Always rely on the deterministic <strong>Test Results</strong> for ground-truth execution outcomes. AI suggestions may occasionally be imperfect or hallucinate execution behavior.
                      </div>
                    </div>

                    <div className="p-4 rounded border bg-slate-900/40 border-slate-800">
                      <div className="font-semibold text-slate-300 mb-2">Code Explanation</div>
                      <div className="text-slate-400 whitespace-pre-wrap">{aiAnalysis.explanation}</div>
                    </div>
                    
                    {aiAnalysis.correctnessIssues.length > 0 && (
                      <div className="p-4 rounded border bg-red-950/10 border-red-900/20">
                        <div className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                          <AlertCircle size={16} /> Potential Issues
                        </div>
                        <ul className="list-disc list-inside text-slate-400 space-y-1">
                          {aiAnalysis.correctnessIssues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded border bg-slate-900/40 border-slate-800">
                        <div className="font-semibold text-slate-300 mb-2">Time Complexity</div>
                        <div className="text-blue-400 font-mono mb-2">{aiAnalysis.complexity.time}</div>
                      </div>
                      <div className="p-4 rounded border bg-slate-900/40 border-slate-800">
                        <div className="font-semibold text-slate-300 mb-2">Space Complexity</div>
                        <div className="text-blue-400 font-mono mb-2">{aiAnalysis.complexity.space}</div>
                      </div>
                      <div className="p-4 rounded border bg-slate-900/40 border-slate-800 md:col-span-2">
                        <div className="font-semibold text-slate-300 mb-2">Complexity Reasoning</div>
                        <div className="text-slate-400">{aiAnalysis.complexity.reasoning}</div>
                      </div>
                    </div>

                    <div className="p-4 rounded border bg-slate-900/40 border-slate-800">
                      <div className="font-semibold text-slate-300 mb-2">Readability & Style</div>
                      <div className="text-slate-400 whitespace-pre-wrap">{aiAnalysis.readability}</div>
                    </div>

                    {aiAnalysis.suggestions.length > 0 && (
                      <div className="p-4 rounded border bg-emerald-950/10 border-emerald-900/20">
                        <div className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                          <CheckCircle2 size={16} /> Improvement Suggestions
                        </div>
                        <ul className="list-disc list-inside text-slate-400 space-y-1">
                          {aiAnalysis.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500">Click "AI Feedback" to analyze your current code.</div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
      </div>

      {/* CONSENT MODAL */}
      <AnimatePresence>
        {(integrityState === 'CONSENT_REQUIRED' || integrityState === 'STARTING') && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="integrity-modal-title"
            >
              <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-800/20">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 id="integrity-modal-title" className="text-xl font-bold text-white">Enter Integrity Mode</h2>
                  <p className="text-sm text-slate-400">Simulate a real technical assessment</p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                <p className="text-slate-300 mb-6 leading-relaxed">
                  While Integrity Mode is active, PrepPilot may use browser-level integrity signals to detect session interruptions or suspicious interaction patterns. You will be asked to remain in the coding session and keep the coding workspace focused.
                </p>

                <div className="bg-slate-950 rounded-lg p-5 border border-slate-800 mb-6">
                  <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Integrity Session Rules</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Stay in the coding workspace</span></li>
                    <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Keep the session active</span></li>
                    <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Follow the assessment instructions</span></li>
                    <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Use only the resources allowed by the assessment</span></li>
                    <li className="flex gap-2 items-start"><CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Exit the session when you are finished</span></li>
                  </ul>
                  <p className="text-xs text-slate-500 mt-4 italic">
                    Note: Some session interruptions may be recorded as integrity events.
                  </p>
                </div>

                {fullscreenError && (
                  <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-lg text-red-400 text-sm flex gap-3 items-start">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <div>
                      <strong className="block font-medium mb-1">Unable to enter fullscreen</strong>
                      {fullscreenError}
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-start pt-0.5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-900 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors flex items-center justify-center">
                      <CheckCircle2 size={14} className={`text-white transition-opacity ${consentChecked ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors select-none leading-relaxed">
                    I understand that Integrity Mode is intended to simulate a proctored coding assessment and that session integrity signals may be used during the session.
                  </span>
                </label>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900 flex justify-end gap-3 shrink-0">
                <button
                  onClick={handleCancelIntegrityFlow}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!consentChecked || integrityState === 'STARTING'}
                  onClick={handleConfirmIntegritySession}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                >
                  {integrityState === 'STARTING' && <Loader2 size={16} className="animate-spin" />}
                  {fullscreenError ? 'Try Again' : 'Start Integrity Session'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* END SESSION MODAL */}
        {integrityState === 'ENDING' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-2">End Integrity Session?</h2>
              <p className="text-slate-400 mb-6">
                Your integrity session will end and you will return to Practice Mode. Your code will not be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelEndSession}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Keep Session
                </button>
                <button
                  onClick={handleConfirmEndSession}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  End Session
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* STRIKE WARNING MODALS */}
        {(enforcementState === 'WARNING' || enforcementState === 'FINAL_WARNING') && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-amber-900/50 rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="warning-modal-title"
            >
              <div className="p-6 border-b border-slate-800 bg-amber-950/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 id="warning-modal-title" className="text-xl font-bold text-amber-500">
                    {enforcementState === 'FINAL_WARNING' ? 'Final Integrity Warning' : 'Integrity Warning'}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-300 mb-4">
                  {enforcementState === 'FINAL_WARNING' 
                    ? 'Another integrity signal was detected:'
                    : 'We detected an integrity signal:'}
                </p>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 text-slate-300 font-medium mb-4">
                  {currentWarningMsg}
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {enforcementState === 'FINAL_WARNING'
                    ? 'This is your final warning. One more integrity strike will end this session.'
                    : 'This is your first warning. Further integrity violations may result in session termination.'}
                </p>
                <button
                  autoFocus
                  onClick={() => setEnforcementState('ACTIVE')}
                  className="w-full px-5 py-2.5 rounded-lg text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                >
                  Continue Session
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* TERMINATED MODAL */}
        {enforcementState === 'TERMINATED' && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-red-900/50 rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="terminated-modal-title"
            >
              <div className="p-6 border-b border-slate-800 bg-red-950/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 id="terminated-modal-title" className="text-xl font-bold text-red-500">
                    Integrity Session Terminated
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-300 mb-4 leading-relaxed">
                  This coding session has been ended because the maximum number of integrity strikes was reached.
                </p>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-6 flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Strikes</span>
                  <span className="text-red-500 font-bold text-lg">{serverSession?.strikeCount || 3} / {serverSession?.maxStrikes || 3}</span>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  You can review your coding result, but this integrity session cannot be resumed.
                </p>
                <button
                  autoFocus
                  onClick={() => navigate('/coding')}
                  className="w-full px-5 py-2.5 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  Return to Coding
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CodingWorkspace;
