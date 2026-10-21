import { Router } from 'express';
import authRoutes from './auth.routes';
import submissionRoutes from './submission.routes';
import reviewRoutes from './review.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Associate Web Instructor Assessment Backend API',
  });
});

router.use('/auth', authRoutes);
router.use('/submissions', submissionRoutes);
router.use('/reviews', reviewRoutes);

export default router;
