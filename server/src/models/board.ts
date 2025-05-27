import mongoose from 'mongoose';

import { BoardDocument } from '../types/board';

const boardSchema = new mongoose.Schema<BoardDocument>({
  title: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

export default mongoose.model('Board', boardSchema);
