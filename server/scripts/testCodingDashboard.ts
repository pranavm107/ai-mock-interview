import { codingDashboardService } from '../src/services/coding/codingDashboardService';

async function test() {
  try {
    const data = await codingDashboardService.getDashboardData('test-user-id', 'Asia/Calcutta');
    console.log(data);
  } catch (error) {
    console.error('Test script error:', error);
  }
}

test();
