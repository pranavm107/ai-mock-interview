import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { getSettings, updateSettings } from '../controllers/settingsController';

const router = Router();

router.get('/', requireAuth(), getSettings);
router.patch('/', requireAuth(), updateSettings);
router.put('/', requireAuth(), updateSettings);

export default router;
