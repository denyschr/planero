import mongoose from 'mongoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';

import { UserDocument } from '../types/user';

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      validate: validator.isEmail,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    return next;
  } catch (error) {
    return next(error as Error);
  }
});

userSchema.methods.verifyPassword = function (password: string): Promise<boolean> {
  return bcryptjs.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
