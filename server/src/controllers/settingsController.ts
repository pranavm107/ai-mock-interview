import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { settingsService } from '../services/settingsService';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: missing user identity' });
      return;
    }

    const settings = await settingsService.getUserSettings(userId);
    res.json(settings);
  } catch (error: any) {
    console.error('[SettingsController] Failed to retrieve settings:', error);
    res.status(500).json({ error: 'Failed to retrieve user settings' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: missing user identity' });
      return;
    }

    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'Invalid settings payload: body must be a JSON object' });
      return;
    }

    const updatedSettings = await settingsService.updateUserSettings(userId, updates);
    res.json(updatedSettings);
  } catch (error: any) {
    console.error('[SettingsController] Failed to update settings:', error);
    const message = error.message || 'Failed to update user settings';
    const isValidationError = message.startsWith('Invalid ') || message.includes('must be');
    res.status(isValidationError ? 400 : 500).json({ error: message });
  }
};
