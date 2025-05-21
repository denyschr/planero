import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user';
import { ExpressRequest } from '../types/express-request';
import authConfig from '../config/auth';

export default async (request: ExpressRequest, response: Response, next: NextFunction) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      response.sendStatus(401);
      return;
    }

    const decoded = jwt.verify(token, authConfig.secret) as { id: string; email: string };
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      response.sendStatus(401);
      return;
    }

    request.currentUser = user;
    next();
  } catch (_) {
    response.sendStatus(401);
  }
};
