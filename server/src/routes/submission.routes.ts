import { Router } from 'express';
import { Role } from '@prisma/client';
import { createSubmission, getMySubmissions } from '../controllers/submission.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { submissionRateLimiter } from '../middlewares/rateLimiter.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createSubmissionSchema } from '../validators/submission.validator';

const router = Router();

// All student submission endpoints require authentication & STUDENT role
router.use(authMiddleware, requireRole([Role.STUDENT]));

router.post(
  '/',
  submissionRateLimiter,
  validateRequest(createSubmissionSchema),
  createSubmission
);

router.get('/my', getMySubmissions);

export default router;
