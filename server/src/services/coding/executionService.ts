import { ExecutionRequest, ExecutionResult, LanguageCapability } from '../../types/execution';
import { execSync } from 'child_process';
import { sandboxRunner } from './sandboxRunner';

export class ExecutionService {
  private isDockerAvailable: boolean = false;
  private readonly MAX_SOURCE_SIZE_BYTES = 256 * 1024; // 256 KB
  private readonly MAX_STDIN_SIZE_BYTES = 64 * 1024; // 64 KB
  
  private activeExecutions = 0;
  private readonly MAX_CONCURRENT_EXECUTIONS = 10;

  constructor() {
    this.checkSandboxAvailability();
  }

  private checkSandboxAvailability() {
    try {
      // Intentionally checking environment capabilities safely without executing user code.
      execSync('docker --version', { stdio: 'ignore' });
      this.isDockerAvailable = true;
    } catch (e) {
      this.isDockerAvailable = false;
      console.warn('ExecutionService: Docker is not available. Secure execution will be disabled.');
    }
  }

  public getSupportedLanguages(): LanguageCapability[] {
    const languages = [
      { id: 'python', name: 'Python' },
      { id: 'java', name: 'Java' },
      { id: 'cpp', name: 'C++' },
      { id: 'c', name: 'C' },
      { id: 'javascript', name: 'JavaScript' },
      { id: 'typescript', name: 'TypeScript' },
      { id: 'go', name: 'Go' },
      { id: 'rust', name: 'Rust' },
      { id: 'csharp', name: 'C#' }
    ];

    return languages.map(lang => ({
      language: lang.id,
      displayName: lang.name,
      executionSupported: this.isDockerAvailable && lang.id === 'python',
      reason: !this.isDockerAvailable ? 'Sandbox unavailable on this host' : (lang.id !== 'python' ? 'Runtime not yet implemented' : undefined)
    }));
  }

  public async execute(userId: string, request: ExecutionRequest): Promise<ExecutionResult> {
    // 1. Validation limits
    if (Buffer.byteLength(request.sourceCode, 'utf8') > this.MAX_SOURCE_SIZE_BYTES) {
      throw new Error('Source code exceeds maximum allowed size (256KB)');
    }
    if (request.stdin && Buffer.byteLength(request.stdin, 'utf8') > this.MAX_STDIN_SIZE_BYTES) {
      throw new Error('Stdin exceeds maximum allowed size (64KB)');
    }

    // 2. Capabilities Check
    const capability = this.getSupportedLanguages().find(c => c.language === request.language);
    if (!capability) {
      return this.buildResult('UNSUPPORTED_LANGUAGE', '');
    }

    if (!capability.executionSupported) {
      if (!this.isDockerAvailable) {
        return this.buildResult('SANDBOX_UNAVAILABLE', 'Secure code execution is temporarily unavailable.');
      }
      return this.buildResult('UNSUPPORTED_LANGUAGE', `Execution for ${capability.displayName} is not yet supported.`);
    }

    // 3. Execution
    if (this.activeExecutions >= this.MAX_CONCURRENT_EXECUTIONS) {
      return this.buildResult('EXECUTION_ERROR', 'Server is too busy. Please try again later.');
    }

    if (request.language === 'python') {
      try {
        this.activeExecutions++;
        return await sandboxRunner.executePython(request);
      } finally {
        this.activeExecutions--;
      }
    }

    return this.buildResult('SANDBOX_UNAVAILABLE', 'Secure execution is currently unavailable.');
  }

  private buildResult(status: ExecutionResult['status'], stderr: string = '', stdout: string = ''): ExecutionResult {
    return {
      status,
      stdout,
      stderr,
      exitCode: null,
      executionTimeMs: null,
      memoryUsedBytes: null
    };
  }
}

export const executionService = new ExecutionService();
