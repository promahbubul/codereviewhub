import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getSubmissions,
  updateSubmissionStatus,
  getStatistics,
} from '../controllers/review.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateStatusSchema } from '../validators/submission.validator';

const router = Router();

// Review routes are strictly accessible to MENTOR and ADMIN
router.use(authMiddleware, requireRole([Role.MENTOR, Role.ADMIN]));

router.get('/statistics', getStatistics);
router.get('/submissions', getSubmissions);
router.patch('/submissions/:id/status', validateRequest(updateStatusSchema), updateSubmissionStatus);

export default router;
