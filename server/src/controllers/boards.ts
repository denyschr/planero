import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';

import BoardModel from '../models/board';
import { ExpressRequest } from '../types/express-request';
import { sendNotFound, sendUnauthorized } from '../utils/responses';
import { getErrorMessage } from '../utils/error-message';
import { SocketRequest } from '../types/socket-request';

export const list = async (request: ExpressRequest, response: Response, next: NextFunction) => {
  try {
    const currentUser = request.currentUser;
    if (!currentUser) {
      return void sendUnauthorized(response, request.originalUrl);
    }
    const boards = await BoardModel.find({ userId: currentUser.id });
    response.send(boards);
  } catch (error) {
    next(error);
  }
};

export const get = async (request: ExpressRequest, response: Response, next: NextFunction) => {
  try {
    const currentUser = request.currentUser;
    if (!currentUser) {
      return void sendUnauthorized(response, request.originalUrl);
    }

    const boardId = request.params.id;
    if (!Types.ObjectId.isValid(boardId)) {
      return void sendNotFound(response, request.originalUrl);
    }

    const board = await BoardModel.findById(boardId);
    if (!board) {
      return void sendNotFound(response, request.originalUrl);
    }

    response.send(board);
  } catch (error) {
    next(error);
  }
};

export const create = async (request: ExpressRequest, response: Response, next: NextFunction) => {
  try {
    const currentUser = request.currentUser;
    if (!currentUser) {
      return void sendUnauthorized(response, request.originalUrl);
    }
    const newBoard = new BoardModel({
      title: request.body.title,
      userId: currentUser.id
    });
    const savedBoard = await newBoard.save();
    response.send(savedBoard);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  io: Server,
  socket: SocketRequest,
  board: { id: string; fields: { title: string } }
) => {
  try {
    if (!socket.currentUser) {
      return void socket.emit('update-board-failure', 'Unauthorized');
    }
    const updatedBoard = await BoardModel.findByIdAndUpdate(board.id, board.fields, { new: true });
    io.to(board.id).emit('update-board-success', updatedBoard);
  } catch (error) {
    socket.emit('update-board-failure', getErrorMessage(error));
  }
};

export const deleteBoard = async (io: Server, socket: SocketRequest, board: { id: string }) => {
  try {
    if (!socket.currentUser) {
      return void socket.emit('delete-board-failure', 'Unauthorized');
    }
    await BoardModel.deleteOne({ _id: board.id });
    io.to(board.id).emit('delete-board-success');
  } catch (error) {
    socket.emit('delete-board-failure', getErrorMessage(error));
  }
};

export const join = (socket: Socket, board: { id: string }) => {
  socket.join(board.id);
};

export const leave = (socket: Socket, board: { id: string }) => {
  socket.leave(board.id);
};
