import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';
import { Socket } from 'socket.io';

import BoardModel from '../models/board';
import { ExpressRequest } from '../types/express-request';
import { sendNotFound, sendUnauthorized } from '../utils/responses';

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
    const { title, backgroundColor } = request.body;
    const newBoard = new BoardModel({
      title,
      userId: currentUser.id,
      backgroundColor
    });
    const savedBoard = await newBoard.save();
    response.send(savedBoard);
  } catch (error) {
    next(error);
  }
};

export const join = (socket: Socket, board: { id: string }) => {
  socket.join(board.id);
};

export const leave = (socket: Socket, board: { id: string }) => {
  socket.leave(board.id);
};
