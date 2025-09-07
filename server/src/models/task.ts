import mongoose from 'mongoose';

import { Task } from '../types/task';

const taskSchema = new mongoose.Schema<Task>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
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
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Task', taskSchema);
