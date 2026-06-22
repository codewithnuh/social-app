import dotenv from 'dotenv';
dotenv.config();
export const env = {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI as string,
  REDIS_URI: process.env.REDIS_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
