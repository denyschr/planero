import mongoose from 'mongoose';

export type Column = {
  title: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Schema.Types.ObjectId;
  boardId: mongoose.Schema.Types.ObjectId;
};
