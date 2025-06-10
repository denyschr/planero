import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';
import { Server } from 'socket.io';

import { ExpressRequest } from '../types/express-request';
import { sendNotFound, sendUnauthorized } from '../utils/responses';
import ColumnModel from '../models/column';
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

    const columns = await ColumnModel.find({ boardId });
    response.send(columns);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  io: Server,
  socket: SocketRequest,
  column: { title: string; boardId: string }
) => {
  try {
    const currentUser = socket.currentUser;
    if (!currentUser) {
      return void socket.emit('create-column-failure', 'Unauthorized');
    }
    const newColumn = new ColumnModel({
      title: column.title,
      boardId: column.boardId,
      userId: currentUser.id
    });
    const savedColumn = await newColumn.save();
    io.to(column.boardId).emit('create-column-success', savedColumn);
  } catch (error) {
    socket.emit('create-column-failure', getErrorMessage(error));
  }
};
