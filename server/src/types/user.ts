import { Document } from 'mongoose';

export interface User {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface UserDocument extends User, Document {
  verifyPassword(password: string): Promise<boolean>;
}
