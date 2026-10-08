import { API_BASE_URL } from '../config/api';
import type { CodingDashboardData, CodingProblem } from '../types/coding';
import type { ExecutionRequest, ExecutionResult } from '../../server/src/types/execution';

export const codingFrontendService = {
  getDashboardData: async (token: string, timezone: string): Promise<CodingDashboardData> => {
    const response = await fetch(`${API_BASE_URL}/api/coding/dashboard?timezone=${encodeURIComponent(timezone)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch coding dashboard data');
    }
    
    const data = await response.json();
    return data.data;
  },

  getProblemBySlug: async (token: string, slug: string): Promise<CodingProblem> => {
    const response = await fetch(`${API_BASE_URL}/api/coding/problems/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch coding problem');
    }

    const data = await response.json();
    return data.data;
  },

  executeCode: async (token: string, request: ExecutionRequest): Promise<ExecutionResult> => {
    const response = await fetch(`${API_BASE_URL}/api/coding/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to execute code');
    }
    return data.data;
  },

  runTests: async (token: string, problemSlug: string, source: string, language: string) => {
    const response = await fetch(`${API_BASE_URL}/api/coding/run-tests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ problemSlug, source, language })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to run tests');
    return data.data;
  },

  submitCode: async (token: string, problemSlug: string, source: string, language: string) => {
    const response = await fetch(`${API_BASE_URL}/api/coding/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ problemSlug, source, language })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to submit code');
    return data.data;
  },

  getSubmissions: async (token: string, problemSlug?: string) => {
    let url = `${API_BASE_URL}/api/coding/submissions`;
    if (problemSlug) {
      url += `?problemSlug=${encodeURIComponent(problemSlug)}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch submissions');
    return data.data;
  }
};
