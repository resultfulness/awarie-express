import mongoose, { Document } from "mongoose";

export interface IAwaria extends Document {
  title: string;
  description: string;
  user: string;
  location: string;
}

const awariaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  location: {
    type: mongoose.Schema.Types.Number,
    ref: "Place",
  },
});

export default mongoose.model<IAwaria>("Awaria", awariaSchema);
