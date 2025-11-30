import dotenv from 'dotenv';
dotenv.config({ path: '.env', quiet: true });

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const REDIS_URL = process.env.REDIS_URL;
const NODE_ENV = process.env.NODE_ENV;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_BUCKET_OBJECT_URL = process.env.S3_BUCKET_OBJECT_URL;
const S3_REGION = process.env.S3_REGION;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

export {
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  NODE_ENV,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT,
  S3_BUCKET_NAME,
  S3_BUCKET_OBJECT_URL,
  S3_REGION,
  corsOptions,
};
