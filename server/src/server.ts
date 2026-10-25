import app from './app';
import prisma from './prisma';
import { env } from './config/env';

const PORT = env.PORT;

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Neon PostgreSQL Database via Prisma');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      console.log(`📡 API Health Check available at http://localhost:${PORT}/api/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔌 Disconnected from database.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
