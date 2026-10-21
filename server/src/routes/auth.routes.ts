import { Router } from 'express';
import { signup, login, getMe } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { signupSchema, loginSchema } from '../validators/auth.validator';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/signup', authRateLimiter, validateRequest(signupSchema), signup);
router.post('/login', authRateLimiter, validateRequest(loginSchema), login);
router.get('/me', authMiddleware, getMe);

export default router;
