import mongoose from 'mongoose';
import type { Logger } from 'pino';
import { config } from './env';

export const connectDatabase = async (logger?: Logger): Promise<void> => {
  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  } satisfies mongoose.ConnectOptions;

  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    try {
      await mongoose.connect(config.mongoUri, options);
      if (logger) {
        logger.info('MongoDB connection established');
      }
      return;
    } catch (error) {
      attempt += 1;
      if (logger) {
        logger.error({ error, attempt }, 'MongoDB connection failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error('MongoDB connection failed after multiple attempts');
};
