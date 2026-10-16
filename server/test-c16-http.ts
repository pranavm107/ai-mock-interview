import request from 'supertest';
import app from './src/app';

async function runHttpTests() {
  console.log('--- Running C16 Express Middleware Tests ---');
  try {
    // 1. Without Token
    const res1 = await request(app)
      .post('/api/coding/integrity/session/fake-123/heartbeat')
      .send();
    
    if (res1.status !== 401) {
      throw new Error(`Expected 401 Unauthorized without token, got ${res1.status}`);
    }
    console.log('✅ 401 Unauthorized confirmed without Clerk token.');

    // 2. With invalid token
    const res2 = await request(app)
      .post('/api/coding/integrity/session/fake-123/heartbeat')
      .set('Authorization', 'Bearer invalid-token')
      .send();
    
    if (res2.status !== 401) {
      throw new Error(`Expected 401 Unauthorized with invalid token, got ${res2.status}`);
    }
    console.log('✅ 401 Unauthorized confirmed with invalid Clerk token.');

    console.log('Middleware correctly protects the C16 heartbeat route.');
    process.exit(0);
  } catch (err) {
    console.error('HTTP Test Failed:', err);
    process.exit(1);
  }
}

runHttpTests();
