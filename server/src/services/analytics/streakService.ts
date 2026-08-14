import { InterviewSession } from '../../types/interviewSession';

export const calculateLongestStreak = (sessions: InterviewSession[]): { currentStreak: number; longestStreak: number } => {
  const completed = sessions.filter(s => s.state === 'COMPLETED');
  
  if (completed.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort descending
  const sorted = [...completed].sort((a, b) => {
    const timeA = new Date(a.completedAt || a.createdAt).getTime();
    const timeB = new Date(b.completedAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  const dates = sorted.map(s => new Date(s.completedAt || s.createdAt).toISOString().split('T')[0]);
  const uniqueDates = [...new Set(dates)];
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];
  
  const isStreakActive = uniqueDates[0] === today || uniqueDates[0] === yesterday;
  
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i > 0) {
      const d1 = new Date(uniqueDates[i - 1]);
      const d2 = new Date(uniqueDates[i]);
      const diffTime = Math.abs(d1.getTime() - d2.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 1;
      }
    }
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;
  
  if (isStreakActive) {
    currentStreak = 1;
    let expectedDate = new Date(uniqueDates[0]);
    for (let i = 1; i < uniqueDates.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      if (uniqueDates[i] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  return { currentStreak, longestStreak };
};
