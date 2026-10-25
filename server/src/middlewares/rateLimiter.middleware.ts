import rateLimit from 'express-rate-limit';
import { AuthRequest } from '../types';

export const submissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each student to 10 project submission requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Runs after authMiddleware, so key by student ID: students sharing one IP (campus/lab Wi-Fi)
  // don't block each other, and one student can't dodge the limit by switching networks.
  keyGenerator: (req) => {
    const userId = (req as AuthRequest).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
  message: {
    success: false,
    message: 'Too many submissions. Please wait 15 minutes before submitting again.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login/signup attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});
