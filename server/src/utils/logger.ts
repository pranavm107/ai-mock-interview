type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogPayload {
  event?: string;
  userId?: string;
  requestId?: string;
  durationMs?: number;
  dataAggregationDurationMs?: number;
  aiGenerationDurationMs?: number;
  generationDurationMs?: number;
  success?: boolean;
  errorCode?: string;
  recommendationType?: string;
  questionCount?: number;
  [key: string]: any;
}

export const logger = {
  log: (level: LogLevel, payload: LogPayload) => {
    // Suppress debug in production unless explicitly enabled
    if (level === 'debug' && process.env.NODE_ENV === 'production' && process.env.LOG_LEVEL !== 'debug') {
      return;
    }

    const { event, ...rest } = payload;
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event: event || 'unspecified_event',
      ...rest
    };

    if (process.env.NODE_ENV === 'development' && !process.env.JSON_LOGS) {
      const msg = `[${level.toUpperCase()}] ${entry.event} - ${JSON.stringify(rest)}`;
      if (level === 'error') console.error(msg);
      else if (level === 'warn') console.warn(msg);
      else console.log(msg);
    } else {
      const msg = JSON.stringify(entry);
      if (level === 'error') console.error(msg);
      else if (level === 'warn') console.warn(msg);
      else console.log(msg);
    }
  },
  info: (payload: LogPayload) => logger.log('info', payload),
  warn: (payload: LogPayload) => logger.log('warn', payload),
  error: (payload: LogPayload) => logger.log('error', payload),
  debug: (payload: LogPayload) => logger.log('debug', payload),
};
