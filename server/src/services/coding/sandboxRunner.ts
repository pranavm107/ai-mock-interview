import Docker from 'dockerode';
import tar from 'tar-stream';
import { ExecutionRequest, ExecutionResult } from '../../types/execution';

const docker = new Docker(); // Connects to /var/run/docker.sock automatically

const PYTHON_IMAGE = 'python:3.12-alpine';

// Limits
const MAX_OUTPUT_SIZE = 1024 * 1024; // 1 MB
const EXECUTION_TIMEOUT_MS = 5000; // 5 seconds

export const sandboxRunner = {
  async executePython(request: ExecutionRequest): Promise<ExecutionResult> {
    const { sourceCode, stdin } = request;
    let container: Docker.Container | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let outputExceeded = false;
    let timedOut = false;

    // Ensure the image exists (this can be optimized to pull only once)
    // For now we assume python:3.12-alpine is pulled/available as stated in prompt

    try {
      const bootstrapper = `import sys; s=int(sys.stdin.readline()); open("/workspace/main.py","w").write(sys.stdin.read(s)); sys.argv=["/workspace/main.py"]; import runpy; runpy.run_path("/workspace/main.py", run_name="__main__")`;

      container = await docker.createContainer({
        Image: PYTHON_IMAGE,
        Cmd: ['sh', '-c', 'echo "$SOURCE_CODE_B64" | base64 -d > /workspace/main.py && if [ -n "$STDIN_B64" ]; then echo "$STDIN_B64" | base64 -d > /workspace/input.txt; else touch /workspace/input.txt; fi && python /workspace/main.py < /workspace/input.txt'],
        Env: [
          `SOURCE_CODE_B64=${Buffer.from(sourceCode, 'utf8').toString('base64')}`,
          `STDIN_B64=${Buffer.from(stdin || '', 'utf8').toString('base64')}`
        ],
        WorkingDir: '/workspace',
        NetworkDisabled: true, // No network
        HostConfig: {
          Memory: 256 * 1024 * 1024, // 256 MB
          MemorySwap: 256 * 1024 * 1024, // Disable swap
          CpuShares: 1024,
          NanoCpus: 1000000000, // 1 CPU
          PidsLimit: 64, // Strict PID limit to prevent fork bombs
          SecurityOpt: ['no-new-privileges'],
          CapDrop: ['ALL'],
          ReadonlyRootfs: true,
          // Writable tmpfs required by Python and for our workspace
          Tmpfs: {
            '/tmp': 'rw,noexec,nosuid,size=65536k,mode=1777',
            '/workspace': 'rw,noexec,nosuid,size=65536k,mode=1777'
          }
        },
        User: 'guest', // Alpine non-root user
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: false,
        OpenStdin: false,
        StdinOnce: false,
      });

      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
        stdin: false,
        hijack: true
      });

      // Start container
      const startTime = Date.now();
      await container.start();

      let stdout = '';
      let stderr = '';
      let totalOutputSize = 0;

      // Dockerode stream demultiplexing
      const processOutput = (buffer: Buffer, type: 'stdout' | 'stderr') => {
        if (outputExceeded) return;
        totalOutputSize += buffer.length;
        if (totalOutputSize > MAX_OUTPUT_SIZE) {
          outputExceeded = true;
          return;
        }
        const text = buffer.toString('utf8');
        if (type === 'stdout') stdout += text;
        else stderr += text;
      };

      const resultPromise = new Promise<{ exitCode: number; oomKilled: boolean }>((resolve, reject) => {
        container!.modem.demuxStream(stream, {
          write: (buf: Buffer) => processOutput(buf, 'stdout')
        }, {
          write: (buf: Buffer) => processOutput(buf, 'stderr')
        });

        stream.on('end', async () => {
          try {
            const data = await container!.inspect();
            resolve({
              exitCode: data.State.ExitCode,
              oomKilled: data.State.OOMKilled
            });
          } catch (e) {
            reject(e);
          }
        });
        
        stream.on('error', (err: any) => reject(err));
      });

      // Timeout handler
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(async () => {
          timedOut = true;
          reject(new Error('TIMEOUT'));
        }, EXECUTION_TIMEOUT_MS);
      });

      let exitCode: number;
      let oomKilled: boolean;
      try {
        const result = await Promise.race([resultPromise, timeoutPromise]);
        exitCode = result.exitCode;
        oomKilled = result.oomKilled;
      } catch (err: any) {
        if (err.message === 'TIMEOUT' || timedOut) {
          return {
            status: 'TIMEOUT',
            stdout: '',
            stderr: 'Execution timed out after 5 seconds.',
            exitCode: null,
            executionTimeMs: EXECUTION_TIMEOUT_MS,
            memoryUsedBytes: null
          };
        }
        throw err;
      }

      const executionTimeMs = Date.now() - startTime;

      if (outputExceeded) {
        return {
          status: 'OUTPUT_LIMIT',
          stdout: stdout.substring(0, MAX_OUTPUT_SIZE) + '... (truncated)',
          stderr,
          exitCode,
          executionTimeMs,
          memoryUsedBytes: null
        };
      }

      if (oomKilled) {
        return {
          status: 'MEMORY_LIMIT',
          stdout,
          stderr: 'Memory limit exceeded (256 MB)',
          exitCode,
          executionTimeMs,
          memoryUsedBytes: null
        };
      }

      // Process standard python exit codes
      let status: ExecutionResult['status'] = 'COMPLETED';
      if (exitCode !== 0) {
        if (stderr.includes('SyntaxError') || stderr.includes('IndentationError')) {
          status = 'COMPILE_ERROR';
        } else {
          status = 'RUNTIME_ERROR';
        }
      }

      return {
        status,
        stdout,
        stderr,
        exitCode,
        executionTimeMs,
        memoryUsedBytes: null
      };

    } catch (error: any) {
      console.error('Docker Sandbox Error:', error);
      return {
        status: 'SANDBOX_ERROR',
        stdout: '',
        stderr: 'Internal execution sandbox error',
        exitCode: null,
        executionTimeMs: null,
        memoryUsedBytes: null
      };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (container) {
        try {
          // Guaranteed cleanup
          await container.remove({ force: true });
        } catch (cleanupError) {
          console.error('Container cleanup failed:', cleanupError);
        }
      }
    }
  }
};
