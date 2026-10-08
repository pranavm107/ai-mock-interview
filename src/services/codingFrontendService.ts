import { API_BASE_URL } from '../config/api';
import type { CodingDashboardData, CodingProblem } from '../types/coding';

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
  }
};
