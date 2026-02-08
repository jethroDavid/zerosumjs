import path from 'path';
import dotenv from 'dotenv';

type GoogleConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

type AppConfig = {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  clientOrigin: string;
  google: GoogleConfig;
};

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL'
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL as string
  }
};
