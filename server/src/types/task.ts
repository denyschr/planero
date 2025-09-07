import mongoose from 'mongoose';

export type Task = {
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Schema.Types.ObjectId;
  boardId: mongoose.Schema.Types.ObjectId;
  columnId: mongoose.Schema.Types.ObjectId;
};
