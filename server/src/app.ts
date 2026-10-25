import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

const allowedOrigins = [env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server) or a whitelisted client origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(Object.assign(new Error(`CORS: Origin ${origin} is not allowed`), { status: 403 }));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API Root Routes
app.use('/api', routes);

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
