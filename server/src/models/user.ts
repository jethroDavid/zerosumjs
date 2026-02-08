import { Schema, model, type Document, type Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String },
    googleId: { type: String }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export const User: Model<IUser> = model<IUser>('User', userSchema);
