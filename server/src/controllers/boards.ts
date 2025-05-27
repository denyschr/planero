import { NextFunction, Response } from 'express';

import BoardModel from '../models/board';
import { ExpressRequest } from '../types/express-request';
import { sendUnauthorized } from '../utils/responses';

export const list = async (request: ExpressRequest, response: Response, next: NextFunction) => {
  try {
    if (!request.currentUser) {
      return void sendUnauthorized(response, request.originalUrl);
    }
    const boards = await BoardModel.find({ userId: request.currentUser.id });
    response.send(boards);
  } catch (error) {
    next(error);
  }
};
