import dotenv from 'dotenv';

dotenv.config();

export default {
  host: process.env.MONGO_HOST || 'localhost',
  port: process.env.MONGO_PORT || 27017,
  name: process.env.MONGO_NAME || 'test'
};
