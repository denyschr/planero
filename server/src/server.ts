import express from 'express';
import mongoose from 'mongoose';

import dbConfig from './config/db';
import * as usersController from './controllers/users';
import authMiddleware from './middlewares/auth';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.get);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
