import { executionService } from './src/services/coding/executionService';
import { ExecutionRequest } from './src/types/execution';

async function runTest(name: string, request: ExecutionRequest, expectedStatus: string) {
  console.log(`\n--- Running Test: ${name} ---`);
  const result = await executionService.execute('test-user', request);
  console.log(`Status: ${result.status} (Expected: ${expectedStatus})`);
  if (result.stdout) console.log(`Stdout:\n${result.stdout}`);
  if (result.stderr) console.log(`Stderr:\n${result.stderr}`);
  
  if (result.status === expectedStatus) {
    console.log('✅ PASS');
  } else {
    console.log('❌ FAIL');
  }
}

async function main() {
  await runTest('Test 1 — Basic Python', {
    language: 'python',
    sourceCode: 'print("Hello PrepPilot")'
  }, 'COMPLETED');

  await runTest('Test 2 — Arithmetic', {
    language: 'python',
    sourceCode: 'print(2 + 3)'
  }, 'COMPLETED');

  await runTest('Test 3 — stdin', {
    language: 'python',
    sourceCode: 'name = input()\nprint(f"Hello {name}")',
    stdin: 'Pranav\n'
  }, 'COMPLETED');

  await runTest('Test 4 — Syntax error', {
    language: 'python',
    sourceCode: 'print('
  }, 'COMPILE_ERROR');

  await runTest('Test 5 — Runtime error', {
    language: 'python',
    sourceCode: 'print(1 / 0)'
  }, 'RUNTIME_ERROR');

  await runTest('Test 6 — Timeout', {
    language: 'python',
    sourceCode: 'while True: pass'
  }, 'TIMEOUT');

  await runTest('Test 7 — Network', {
    language: 'python',
    sourceCode: 'import urllib.request\nurllib.request.urlopen("https://example.com", timeout=2)'
  }, 'RUNTIME_ERROR'); // urllib.error.URLError

  await runTest('Test 8 — Memory', {
    language: 'python',
    sourceCode: 'x = bytearray(1024 * 1024 * 1024)\nprint("should not complete")'
  }, 'MEMORY_LIMIT');

  await runTest('Test 9 — Output', {
    language: 'python',
    sourceCode: 'print("x" * (1024 * 1024 + 10))'
  }, 'OUTPUT_LIMIT');

  await runTest('Test 10 — Non-root', {
    language: 'python',
    sourceCode: 'import os\nprint(os.getuid())'
  }, 'COMPLETED');

  await runTest('Test 11 — Environment', {
    language: 'python',
    sourceCode: 'import os\nprint(dict(os.environ))'
  }, 'COMPLETED');

  await runTest('Test 12 — Filesystem', {
    language: 'python',
    sourceCode: 'import os\ntry:\n  print(os.listdir("/"))\nexcept Exception as e:\n  print(e)'
  }, 'COMPLETED'); // The host is isolated, so reading "/" just shows container root, not host
}

main().catch(console.error);
