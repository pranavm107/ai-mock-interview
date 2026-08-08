import { API_BASE_URL } from '../config/api';
import type { AchievementsResponse } from '../types/achievement';

export const fetchUserAchievements = async (token: string, signal?: AbortSignal): Promise<AchievementsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/achievements`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    signal
  });

  if (!response.ok) {
    throw new Error('Failed to fetch achievements');
  }

  return response.json();
};
