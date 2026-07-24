import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
  generateReview,
  getReview,
  listReviews,
  deleteReview
} from '../controllers/reviewController';

const router = Router();

// Base route is /api/reviews

router.post('/:sessionId/generate', requireAuth(), generateReview);
router.get('/:sessionId', requireAuth(), getReview);
router.get('/', requireAuth(), listReviews);
router.delete('/:reviewId', requireAuth(), deleteReview);

export default router;
