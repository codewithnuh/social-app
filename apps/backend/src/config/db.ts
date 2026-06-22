import mongoose from 'mongoose';
import { env } from './env';
export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI);
    console.log('Mongo DB connected Successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
