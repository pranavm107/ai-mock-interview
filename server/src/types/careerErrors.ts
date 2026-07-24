export class CareerGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CareerGenerationError';
  }
}

export class CareerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CareerValidationError';
  }
}

export class GeminiTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiTimeoutError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class FirestoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirestoreError';
  }
}
