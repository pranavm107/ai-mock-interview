import { API_BASE_URL } from '../config/api';
import type { UserSettings, UserSettingsUpdate } from '../types/settings';

export const fetchUserSettings = async (token: string, signal?: AbortSignal): Promise<UserSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Failed to fetch settings (Status ${response.status})`);
  }

  return response.json();
};

export const updateUserSettings = async (
  token: string,
  updates: UserSettingsUpdate,
  signal?: AbortSignal
): Promise<UserSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Failed to save settings (Status ${response.status})`);
  }

  return response.json();
};
