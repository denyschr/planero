import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

import UserModel from '../models/user';
import { ExpressRequest } from '../types/express-request';
import authConfig from '../config/auth';
import { sendUnauthorized } from '../utils/responses';

export default async (request: ExpressRequest, response: Response, next: NextFunction) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return void sendUnauthorized(response, request.originalUrl);
    }

    const decoded = jwt.verify(token, authConfig.secret) as { id: string; email: string };
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return void sendUnauthorized(response, request.originalUrl);
    }

    request.currentUser = user;
    next();
  } catch (_) {
    sendUnauthorized(response, request.originalUrl);
  }
};
