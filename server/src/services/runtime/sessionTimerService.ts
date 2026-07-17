export const calculateElapsedMs = (startTime: string, endTime: string): number => {
  return new Date(endTime).getTime() - new Date(startTime).getTime();
};

export const isTimeLimitExceeded = (startTime: string, limitMs: number): boolean => {
  const elapsed = new Date().getTime() - new Date(startTime).getTime();
  return elapsed > limitMs;
};

// In a real production system, this could use Redis or an in-memory store for precise distributed ticking.
// For now, we rely on timestamp diffs calculated dynamically when actions occur.
