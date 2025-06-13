import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';
import { Server } from 'socket.io';

import { ExpressRequest } from '../types/express-request';
import { sendNotFound, sendUnauthorized } from '../utils/responses';
import TaskModel from '../models/task';
import { SocketRequest } from '../types/socket-request';
import { getErrorMessage } from '../utils/error-message';

export const list = async (request: ExpressRequest, response: Response, next: NextFunction) => {
  try {
    if (!request.currentUser) {
      return void sendUnauthorized(response, request.originalUrl);
    }

    const boardId = request.params.id;
    if (!Types.ObjectId.isValid(boardId)) {
      return void sendNotFound(response, request.originalUrl);
    }

    const tasks = await TaskModel.find({ boardId });
    response.send(tasks);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  io: Server,
  socket: SocketRequest,
  task: { title: string; boardId: string; columnId: string }
) => {
  try {
    const currentUser = socket.currentUser;
    if (!currentUser) {
      return void socket.emit('create-task-failure', 'Unauthorized');
    }
    const newTask = new TaskModel({
      title: task.title,
      userId: currentUser.id,
      boardId: task.boardId,
      columnId: task.columnId
    });
    const savedTask = await newTask.save();
    io.to(task.boardId).emit('create-task-success', savedTask);
  } catch (error) {
    socket.emit('create-task-failure', getErrorMessage(error));
  }
};

export const update = async (
  io: Server,
  socket: SocketRequest,
  task: {
    id: string;
    boardId: string;
    fields: { title?: string; description?: string; columnId?: string };
  }
) => {
  try {
    if (!socket.currentUser) {
      return void socket.emit('update-task-failure', 'Unauthorized');
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(task.id, task.fields, {
      new: true
    });
    io.to(task.boardId).emit('update-task-success', updatedTask);
  } catch (error) {
    socket.emit('update-task-failure', getErrorMessage(error));
  }
};

export const deleteTask = async (
  io: Server,
  socket: SocketRequest,
  task: { id: string; boardId: string }
) => {
  try {
    if (!socket.currentUser) {
      return void socket.emit('delete-task-failure', 'Unauthorized');
    }
    await TaskModel.deleteOne({ _id: task.id });
    io.to(task.boardId).emit('delete-task-success', task.id);
  } catch (error) {
    socket.emit('delete-task-failure', getErrorMessage(error));
  }
};
