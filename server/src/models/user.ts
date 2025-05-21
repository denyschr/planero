import { model, Schema } from 'mongoose';
import validator from 'validator';
import { UserDocument } from '../types/user';
import bcryptjs from 'bcryptjs';

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      validate: [validator.isEmail, 'Email is not valid'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
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

export default model('User', userSchema);
