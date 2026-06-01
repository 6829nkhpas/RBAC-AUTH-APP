import dotenv from 'dotenv';
// Load environment configs
dotenv.config();

import app from './app';
import { logger } from './utils/logger';
import { prisma } from './config/db';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`⚡ Server is actively listening on http://localhost:${PORT}`);
  logger.info(`📖 Interactive API Documentation served at http://localhost:${PORT}/api/v1/docs`);
});

// Capture unexpected synchronous exceptions
process.on('uncaughtException', (error) => {
  logger.error('CRITICAL: Uncaught Exception detected!', error);
  gracefulShutdown(1);
});

// Capture unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('CRITICAL: Unhandled Promise Rejection detected at promise:', promise, 'reason:', reason);
  gracefulShutdown(1);
});

// Capture termination signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown sequence...');
  gracefulShutdown(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Starting graceful shutdown sequence...');
  gracefulShutdown(0);
});

function gracefulShutdown(code: number) {
  logger.info('Shutting down server connection pools...');
  
  server.close(async () => {
    logger.info('Express server successfully closed.');
    
    try {
      await prisma.$disconnect();
      logger.info('Database connection safely released.');
      process.exit(code);
    } catch (dbError) {
      logger.error('Error during database disconnection:', dbError);
      process.exit(1);
    }
  });

  // Force shutdown after 10s if connections remain active
  setTimeout(() => {
    logger.error('Shutdown timeout reached. Forcing immediate termination.');
    process.exit(1);
  }, 10000);
}
