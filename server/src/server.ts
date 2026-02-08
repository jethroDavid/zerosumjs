import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { connectDatabase } from './config/db';
import { config } from './config/env';
import { passport } from './config/passport';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todos';
import { errorHandler } from './middleware/error';

const app = express();
const logger = pino({ name: 'server-api' });

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(passport.initialize() as any);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.use('/api/auth/google/failure', (_req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const start = async (): Promise<void> => {
  await connectDatabase(logger);
  app.listen(config.port, () => {
    logger.info(`API listening on port ${config.port}`);
  });
};

start();
