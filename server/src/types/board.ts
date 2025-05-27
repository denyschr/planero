import mongoose from 'mongoose';

export type Board = {
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Schema.Types.ObjectId;
};

export type BoardDocument = Board & mongoose.Document;
