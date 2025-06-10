import { createServer } from 'http';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import dbConfig from './config/db';
import authConfig from './config/auth';
import * as usersController from './controllers/users';
import * as boardsController from './controllers/boards';
import authMiddleware from './middlewares/auth';
import { SocketRequest } from './types/socket-request';
import UserModel from './models/user';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4000'
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.set('toJSON', {
  virtuals: true,
  transform: (_, converted) => {
    delete converted._id;
  }
});

app.post('/api/users', usersController.register);
app.post('/api/users/login', usersController.login);
app.get('/api/user', authMiddleware, usersController.get);
app.get('/api/boards', authMiddleware, boardsController.list);
app.get('/api/boards/:id', authMiddleware, boardsController.get);
app.post('/api/boards', authMiddleware, boardsController.create);

const PORT = process.env.PORT || 3000;

io.use(async (socket: SocketRequest, next) => {
  try {
    const token = (socket.handshake.auth.token as string) ?? '';
    const decoded = jwt.verify(token.split(' ')[1], authConfig.secret) as {
      id: string;
      email: string;
    };

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.currentUser = user;
    next();
  } catch (_) {
    next(new Error('Authentication error'));
  }
}).on('connection', (socket) => {
  socket.on('join-board', (board) => {
    boardsController.join(socket, board);
  });

  socket.on('leave-board', (board) => {
    boardsController.leave(socket, board);
  });
});

mongoose
  .connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
