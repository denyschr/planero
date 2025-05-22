import { NextFunction, Request, Response } from 'express';
import { Error } from 'mongoose';
import jwt from 'jsonwebtoken';

import UserModel from '../models/user';
import { UserDocument } from '../types/user';
import authConfig from '../config/auth';
import { ExpressRequest } from '../types/express-request';
import { sendUnauthorized, sendUnprocessableEntity } from '../utils/responses';

const normalizeUser = ({ id, username, email }: UserDocument) => {
  const token = jwt.sign({ id, email }, authConfig.secret);
  return {
    id,
    username,
    email,
    token
  };
};

export const register = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { username, email, password } = request.body;
    const userByUsername = await UserModel.findOne({ username });
    if (userByUsername) {
      return void sendUnprocessableEntity(response, request.originalUrl);
    }

    const userByEmail = await UserModel.findOne({ email });
    if (userByEmail) {
      return void sendUnprocessableEntity(response, request.originalUrl);
    }

    const newUser = new UserModel({ username, email, password });
    const savedUser = await newUser.save();

    response.status(201).send(normalizeUser(savedUser));
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      return void sendUnprocessableEntity(response, request.originalUrl);
    }
    next(error);
  }
};

export const login = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body;
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return void sendUnauthorized(response, request.originalUrl);
    }

    const matched = await user.verifyPassword(password);
    if (!matched) {
      return void sendUnauthorized(response, request.originalUrl);
    }

    response.status(200).send(normalizeUser(user));
  } catch (error) {
    next(error);
  }
};

export const get = async (request: ExpressRequest, response: Response) => {
  if (!request.currentUser) {
    return void sendUnauthorized(response, request.originalUrl);
  }
  response.send(normalizeUser(request.currentUser));
};
