import mongoose from 'mongoose';

export type User = {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = User &
  mongoose.Document & {
    verifyPassword(password: string): Promise<boolean>;
  };
