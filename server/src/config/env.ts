import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    // Fail fast at boot instead of silently signing tokens with a guessable fallback secret
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
};
