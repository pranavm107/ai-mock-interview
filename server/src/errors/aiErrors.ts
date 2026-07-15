export class AIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public retryable: boolean,
    public phase: string = 'ANALYZING'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class QuotaExceededError extends AIError {
  constructor(message: string = 'Gemini daily API quota exceeded.') {
    super('GEMINI_QUOTA_EXCEEDED', message, false);
  }
}

export class InvalidApiKeyError extends AIError {
  constructor(message: string = 'Invalid Gemini API Key.') {
    super('INVALID_API_KEY', message, false);
  }
}

export class ModelUnavailableError extends AIError {
  constructor(message: string = 'Gemini model is currently unavailable.') {
    super('MODEL_UNAVAILABLE', message, true);
  }
}

export class TransientAIError extends AIError {
  constructor(message: string = 'Temporary network or API failure.') {
    super('TRANSIENT_AI_ERROR', message, true);
  }
}
