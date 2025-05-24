import { Document } from 'mongoose';

export type User = {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
};

export type UserDocument = User &
  Document & {
    verifyPassword(password: string): Promise<boolean>;
  };
