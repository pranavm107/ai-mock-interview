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

export class GroqTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroqTimeoutError';
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
