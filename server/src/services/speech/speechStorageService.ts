import { db } from '../../config/firebase.config';
import { doc, setDoc, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { CommunicationAnalytics, SpeechAnalyticsRecord, SessionSpeechSummary } from '../../types/speech';

export const saveSpeechAnalytics = async (
  sessionId: string,
  answerId: string,
  questionIndex: number,
  durationMs: number,
  analytics: CommunicationAnalytics,
  liveEvaluation?: any
): Promise<void> => {
  const record: SpeechAnalyticsRecord = {
    id: `speech_${answerId}`,
    sessionId,
    answerId,
    questionIndex,
    timestamp: new Date().toISOString(),
    durationMs,
    analytics,
    liveEvaluation
  };

  // Save the individual answer's speech analytics
  const docRef = doc(db, 'speechAnalytics', record.id);
  await setDoc(docRef, record);

  // Recalculate session summary
  await recalculateSessionSpeechSummary(sessionId);
};

export const getSpeechTimeline = async (sessionId: string): Promise<SpeechAnalyticsRecord[]> => {
  const q = query(collection(db, 'speechAnalytics'), where('sessionId', '==', sessionId));
  const snap = await getDocs(q);
  const records = snap.docs.map(d => d.data() as SpeechAnalyticsRecord);
  return records.sort((a, b) => a.questionIndex - b.questionIndex);
};

export const recalculateSessionSpeechSummary = async (sessionId: string): Promise<SessionSpeechSummary | null> => {
  const timeline = await getSpeechTimeline(sessionId);
  if (timeline.length === 0) return null;

  let sumComm = 0, sumFluency = 0, sumGrammar = 0, sumVocab = 0, sumPronun = 0, sumConf = 0, sumPace = 0, sumPause = 0, sumFillers = 0;
  
  timeline.forEach(r => {
    sumComm += r.analytics.communicationScore;
    sumFluency += r.analytics.fluencyScore;
    sumGrammar += r.analytics.grammarScore;
    sumVocab += r.analytics.vocabularyScore;
    sumPronun += r.analytics.pronunciationScore;
    sumConf += r.analytics.confidenceScore;
    sumPace += r.analytics.pace.wpm;
    sumPause += r.analytics.pauseMetrics.averagePauseMs;
    sumFillers += r.analytics.fillerWords.count;
  });

  const count = timeline.length;
  // Calculate trend based on first vs last half, or just simple first to last
  let trend: "Improving" | "Stable" | "Declining" = "Stable";
  if (count > 1) {
    const firstComm = timeline[0].analytics.communicationScore;
    const lastComm = timeline[count - 1].analytics.communicationScore;
    if (lastComm > firstComm + 5) trend = "Improving";
    else if (lastComm < firstComm - 5) trend = "Declining";
  }

  // Get recommendations from the last answer or all of them. Let's combine unique ones from the last 2 answers.
  const recSet = new Set<string>();
  timeline.slice(-2).forEach(r => {
    r.analytics.recommendations.forEach(rec => recSet.add(rec));
  });

  const summary: SessionSpeechSummary = {
    id: sessionId,
    averageCommunicationScore: Math.round(sumComm / count),
    averageFluency: Math.round(sumFluency / count),
    averageGrammar: Math.round(sumGrammar / count),
    averageVocabulary: Math.round(sumVocab / count),
    averagePronunciation: Math.round(sumPronun / count),
    averageConfidence: Math.round(sumConf / count),
    averagePace: Math.round(sumPace / count),
    averagePauseDuration: Math.round(sumPause / count),
    averageFillers: Math.round(sumFillers / count),
    trend,
    recommendations: Array.from(recSet).slice(0, 5),
    updatedAt: new Date().toISOString()
  };

  const sumRef = doc(db, 'sessionSpeechSummaries', sessionId);
  await setDoc(sumRef, summary);
  
  return summary;
};

export const getSessionSpeechSummary = async (sessionId: string): Promise<SessionSpeechSummary | null> => {
  const sumRef = doc(db, 'sessionSpeechSummaries', sessionId);
  const snap = await getDoc(sumRef);
  if (snap.exists()) {
    return snap.data() as SessionSpeechSummary;
  }
  return null;
};

// Keep old method signature just in case any other part of code calls it
export const getSpeechAnalytics = async (sessionId: string): Promise<CommunicationAnalytics | null> => {
  const timeline = await getSpeechTimeline(sessionId);
  if (timeline.length === 0) return null;
  return timeline[timeline.length - 1].analytics; // fallback to last
};
