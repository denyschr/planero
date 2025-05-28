import mongoose from 'mongoose';

export type Board = {
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: mongoose.Schema.Types.ObjectId;
  backgroundColor: string;
};

export type BoardDocument = Board & mongoose.Document;
