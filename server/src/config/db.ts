import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const databaseHost = process.env.MONGO_HOST;
const databaseName = process.env.MONGO_NAME;

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://${databaseHost}/${databaseName}`);
    console.log('DB connection success!');
  } catch (error) {
    console.log('DB connection error:', (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;
