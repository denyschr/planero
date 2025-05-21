import { NextFunction, Request, Response } from 'express';
import UserModel from '../models/user';
import { UserDocument } from '../types/user';
import { Error } from 'mongoose';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const normalizeUser = ({ id, username, email }: UserDocument) => {
  const token = jwt.sign({ id, email }, SECRET_KEY);
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
    }
    next(error);
  }
};
