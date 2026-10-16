import { evaluationService } from './src/services/coding/evaluationService';
import { db } from './src/config/firebaseAdmin';

const MOCK_USER_ID = 'test-c5-user';

async function runTests() {
  console.log('--- Starting C5 Tests ---');
  
  // Test 1: Public tests logic
  console.log('\\n--- Test 1: Public test evaluation (Run Tests) ---');
  try {
    const res = await evaluationService.evaluate(MOCK_USER_ID, 'two-sum', `
import json
import sys

input_data = sys.stdin.read().splitlines()
nums = json.loads(input_data[0])
target = int(input_data[1])

for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            print(json.dumps([i, j]))
            sys.exit(0)
`, 'python', false);
    
    console.log(`Status: ${res.status}`);
    console.log(`Passed Tests: ${res.passedTests}/${res.totalTests}`);
    console.log(`Total tests should only include public tests (2): ${res.totalTests === 2 ? 'PASS' : 'FAIL'}`);
    console.log(`Result array hides nothing because these are public:`);
    console.log(res.testResults.map(t => ({ id: t.testCaseId, status: t.status, hidden: t.isHidden })));
  } catch (err: any) {
    console.error('Test 1 Failed:', err.message);
  }

  // Test 2: Submission evaluation (All tests)
  console.log('\\n--- Test 2: Submission evaluation (Submit) ---');
  try {
    const res = await evaluationService.evaluate(MOCK_USER_ID, 'two-sum', `
import json
import sys

input_data = sys.stdin.read().splitlines()
nums = json.loads(input_data[0])
target = int(input_data[1])

for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            print(json.dumps([i, j]))
            sys.exit(0)
`, 'python', true);
    
    console.log(`Status: ${res.status}`);
    console.log(`Passed Tests: ${res.passedTests}/${res.totalTests}`);
    console.log(`Total tests should include all tests (5): ${res.totalTests === 5 ? 'PASS' : 'FAIL'}`);
    
    const hasHidden = res.testResults.some(t => t.isHidden);
    const exposedHiddenData = res.testResults.some(t => t.isHidden && (t.input !== undefined || t.expectedOutput !== undefined));
    console.log(`Contains hidden tests: ${hasHidden ? 'PASS' : 'FAIL'}`);
    console.log(`Exposed hidden expected/input data: ${exposedHiddenData ? 'FAIL' : 'PASS'}`);
  } catch (err: any) {
    console.error('Test 2 Failed:', err.message);
  }

  // Test 3: Wrong Answer Submission
  console.log('\\n--- Test 3: Wrong Answer Submission ---');
  try {
    const res = await evaluationService.evaluate(MOCK_USER_ID, 'two-sum', `
print("[0, 1]")
`, 'python', true);
    
    console.log(`Status (Expected WRONG_ANSWER): ${res.status}`);
    console.log(`Passed Tests: ${res.passedTests}/${res.totalTests}`);
  } catch (err: any) {
    console.error('Test 3 Failed:', err.message);
  }

  // Test 4: Verify Persistence
  console.log('\\n--- Test 4: Verify Persistence ---');
  try {
    const snapshot = await db.collection('codingSubmissions').where('userId', '==', MOCK_USER_ID).get();
    console.log(`Saved submissions in Firestore: ${snapshot.size}`);
    console.log(`Persistence successful: ${snapshot.size > 0 ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    console.error('Test 4 Failed:', err.message);
  }

  process.exit(0);
}

runTests().catch(console.error);
