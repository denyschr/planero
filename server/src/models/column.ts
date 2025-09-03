import mongoose from 'mongoose';

import { Column } from '../types/column';

const columnSchema = new mongoose.Schema<Column>(
  {
    title: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Column', columnSchema);
