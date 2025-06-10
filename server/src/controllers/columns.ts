import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';

import { ExpressRequest } from '../types/express-request';
import { sendNotFound, sendUnauthorized } from '../utils/responses';
import ColumnModel from '../models/column';

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
