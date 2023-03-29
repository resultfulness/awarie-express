import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  usertype: string;
  locations: string;
  validatePassword(password: string): boolean;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    required: true,
  },
  locations: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  const user = this as unknown as IUser;

  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (e) {
    return next(e);
  }
});

userSchema.methods.validatePassword = async function (pass: string) {
  return bcrypt.compare(pass, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
