import { NextFunction, Request, Response } from 'express';
import UserModel from '../models/user';
import { UserDocument } from '../types/user';
import { Error } from 'mongoose';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';
import { ExpressRequest } from '../types/express-request';

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
    const newUser = new UserModel(request.body);
    const savedUser = await newUser.save();
    response.status(201).send(normalizeUser(savedUser));
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      const messages = Object.values(error.errors).map((e) => e.message);
      response.status(422).json(messages);
      return;
    }
    next(error);
  }
};

export const login = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body;
    const user = await UserModel.findOne({ email }).select('+password');
    const errors = { emailOrPassword: 'Incorrect email or password ' };
    if (!user) {
      response.status(401).json(errors);
      return;
    }

    const matched = await user.verifyPassword(password);
    if (!matched) {
      response.status(401).json(errors);
      return;
    }

    response.status(200).send(normalizeUser(user));
  } catch (error) {
    next(error);
  }
};

export const get = async (request: ExpressRequest, response: Response) => {
  if (!request.currentUser) {
    response.sendStatus(401);
    return;
  }
  response.send(normalizeUser(request.currentUser));
};
