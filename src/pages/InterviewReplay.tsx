import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams } from 'react-router-dom';
import type { ReplaySession, ReplayPlayerState, ReplayBookmark } from '../types/replay';
import { ReplayHeader } from '../components/replay/ReplayHeader';
import { ReplaySidebar } from '../components/replay/ReplaySidebar';
import { ReplayPlayer } from '../components/replay/ReplayPlayer';
import { ReplayTranscript } from '../components/replay/ReplayTranscript';
import { ReplayTimeline } from '../components/replay/ReplayTimeline';
import { ReplayBookmarks } from '../components/replay/ReplayBookmarks';
import { ReplayNavigation } from '../components/replay/ReplayNavigation';
import { ReplayLoading } from '../components/replay/ReplayLoading';
import { ReplayError } from '../components/replay/ReplayError';
import { ReplayEmpty } from '../components/replay/ReplayEmpty';

const fetchReplaySession = async (sessionId: string, token: string): Promise<ReplaySession> => {
  const response = await fetch(`http://localhost:3001/api/interview-sessions/${sessionId}/replay`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('Unauthorized access');
    throw new Error('Failed to load replay');
  }
  return response.json();
};

export default function InterviewReplay() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userId, getToken } = useAuth();
  
  const [session, setSession] = useState<ReplaySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarkError, setBookmarkError] = useState('');
  
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<ReplayPlayerState>({
    status: 'Idle',
    currentTimeMs: 0,
    durationMs: 0,
    playbackSpeed: 1,
    volume: 1,
  });

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionId || !userId) return;
    setLoading(true);
    getToken().then(token => {
      if (!token) throw new Error('No authentication token available');
      return fetchReplaySession(sessionId, token);
    })
      .then(data => {
        setSession(data);
        if (data.questions.length > 0) {
          setCurrentQuestionId(data.questions[0].id);
          setPlayerState(prev => ({ ...prev, durationMs: data.questions[0].answer?.durationMs || 0 }));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId, userId, getToken]);

  // Audio simulation (Since we don't have real audio URLs yet)
  useEffect(() => {
    if (playerState.status === 'Playing') {
      timerRef.current = window.setInterval(() => {
        setPlayerState(prev => {
          const nextTime = prev.currentTimeMs + (100 * prev.playbackSpeed);
          if (nextTime >= prev.durationMs) {
            return { ...prev, currentTimeMs: prev.durationMs, status: 'Completed' };
          }
          return { ...prev, currentTimeMs: nextTime };
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playerState.status, playerState.playbackSpeed]);

  const currentQuestion = useMemo(() => {
    if (!session) return null;
    return session.questions.find(q => q.id === currentQuestionId) || session.questions[0];
  }, [session, currentQuestionId]);
  
  const navigation = useMemo(() => {
    if (!session) return { previousQuestionId: null, nextQuestionId: null, currentQuestionId: null };
    const qIndex = session.questions.findIndex(q => q.id === currentQuestionId);
    return {
      previousQuestionId: qIndex > 0 ? session.questions[qIndex - 1].id : null,
      nextQuestionId: qIndex < session.questions.length - 1 ? session.questions[qIndex + 1].id : null,
      currentQuestionId
    };
  }, [session, currentQuestionId]);

  const handleSelectQuestion = useCallback((id: string) => {
    if (!session) return;
    setCurrentQuestionId(id);
    const q = session.questions.find(x => x.id === id);
    setPlayerState(prev => ({
      ...prev,
      currentTimeMs: 0,
      durationMs: q?.answer?.durationMs || 0,
      status: 'Idle'
    }));
  }, [session]);

  const handleAddBookmark = useCallback(async (note: string, type: ReplayBookmark['type']) => {
    if (!sessionId || !userId) return;
    setBookmarkError('');
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api/interview-sessions/${sessionId}/bookmarks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, note, questionId: currentQuestionId, timeOffsetMs: playerState.currentTimeMs, timestamp: new Date().toISOString() })
      });
      if (!response.ok) throw new Error('Failed to save bookmark');
      const newBookmark = await response.json();
      setSession(prev => prev ? { ...prev, bookmarks: [...prev.bookmarks, newBookmark] } : prev);
    } catch (e: any) {
      console.error(e);
      setBookmarkError(e.message || 'Error saving bookmark');
    }
  }, [sessionId, userId, getToken, currentQuestionId, playerState.currentTimeMs]);

  const handleDeleteBookmark = useCallback(async (bookmarkId: string) => {
    if (!sessionId || !userId) return;
    setBookmarkError('');
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/api/interview-sessions/${sessionId}/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete bookmark');
      setSession(prev => prev ? { ...prev, bookmarks: prev.bookmarks.filter(b => b.id !== bookmarkId) } : prev);
    } catch (e: any) {
      console.error(e);
      setBookmarkError(e.message || 'Error deleting bookmark');
    }
  }, [sessionId, userId, getToken]);

  const handlePlay = useCallback(() => setPlayerState(prev => ({ ...prev, status: prev.currentTimeMs >= prev.durationMs ? 'Playing' : 'Playing', currentTimeMs: prev.currentTimeMs >= prev.durationMs ? 0 : prev.currentTimeMs })), []);
  const handlePause = useCallback(() => setPlayerState(prev => ({ ...prev, status: 'Paused' })), []);
  const handleSeek = useCallback((ms: number) => setPlayerState(prev => ({ ...prev, currentTimeMs: ms })), []);
  const handleSpeedChange = useCallback((speed: number) => setPlayerState(prev => ({ ...prev, playbackSpeed: speed })), []);
  const handleVolumeChange = useCallback((volume: number) => setPlayerState(prev => ({ ...prev, volume })), []);
  const handleTimelineSeek = useCallback((ms: number) => {
    if (!session) return;
    const evt = session.timeline.find(t => t.timeOffsetMs >= ms);
    if (evt && evt.questionId) {
      handleSelectQuestion(evt.questionId);
    }
  }, [session, handleSelectQuestion]);

  const handleJumpToBookmark = useCallback((bm: ReplayBookmark) => {
    handleSelectQuestion(bm.questionId);
    setPlayerState(prev => ({ ...prev, currentTimeMs: bm.timeOffsetMs, status: 'Paused' }));
  }, [handleSelectQuestion]);

  if (loading) return <ReplayLoading />;
  if (error) return <ReplayError message={error} />;
  if (!session || session.questions.length === 0 || !currentQuestion) return <ReplayEmpty />;



  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <ReplayHeader metadata={session.metadata} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/4 min-w-[300px] flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-0">
          <div className="flex-1 overflow-hidden">
            <ReplaySidebar 
              questions={session.questions} 
              currentQuestionId={currentQuestionId} 
              onSelectQuestion={handleSelectQuestion} 
            />
          </div>
          <div className="flex-1 overflow-hidden border-t border-slate-200 dark:border-slate-800 relative">
            {bookmarkError && (
              <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 text-xs p-2 text-center z-10 shadow-sm border-b border-red-200">
                {bookmarkError}
              </div>
            )}
            <ReplayBookmarks 
              bookmarks={session.bookmarks} 
              onAddBookmark={handleAddBookmark} 
              onJumpToBookmark={handleJumpToBookmark} 
              onDeleteBookmark={handleDeleteBookmark}
            />
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col h-full p-6 bg-slate-50 dark:bg-slate-900 overflow-hidden">
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full gap-6">
            <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                Question {currentQuestion.index + 1}: {currentQuestion.text}
              </h2>
              
              <ReplayTranscript 
                transcript={currentQuestion.answer?.transcript || []} 
                currentTimeMs={playerState.currentTimeMs} 
                onSeek={handleSeek} 
              />
            </div>

            <div className="shrink-0">
              <ReplayPlayer 
                playerState={playerState} 
                onPlay={handlePlay} 
                onPause={handlePause} 
                onSeek={handleSeek} 
                onSpeedChange={handleSpeedChange} 
                onVolumeChange={handleVolumeChange} 
              />
            </div>

            <div className="shrink-0">
              <ReplayNavigation 
                navigation={navigation} 
                onNavigate={handleSelectQuestion} 
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 min-w-[300px] h-full z-0 border-l border-slate-200 dark:border-slate-800">
          <ReplayTimeline 
            timeline={session.timeline} 
            currentTimeMs={playerState.currentTimeMs} 
            onSeek={handleTimelineSeek} 
          />
        </div>
      </div>
    </div>
  );
}
