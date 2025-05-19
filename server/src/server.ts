import express from 'express';
import { createServer } from 'http';
import connectDB from './config/db';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
