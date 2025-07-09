import mongoose from 'mongoose';

import { Board } from '../types/board';

const boardSchema = new mongoose.Schema<Board>(
  {
    title: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Board', boardSchema);
