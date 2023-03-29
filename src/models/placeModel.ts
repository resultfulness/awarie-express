import mongoose, { Document } from "mongoose";

export interface IPlace extends Document {
  id: number;
  name: string;
  placeType: string;
  parent: number;
}

const placeSchema = new mongoose.Schema({
  _id: {
    type: Number,
    alias: "id",
    required: true,
    createIndex: { unique: true },
  },
  name: {
    type: String,
    required: true,
  },
  placeType: {
    type: String,
    required: true,
  },
  parent: {
    type: Number,
    required: true,
  },
});

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

// Add a static "increment" method to the Model
// It will recieve the collection name for which to increment and return the counter value
counterSchema.static("increment", async function (counterName) {
  const count = await this.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    // new: return the new value
    // upsert: create document if it doesn't exist
    { new: true, upsert: true }
  );
  return count.seq;
});

const CounterModel = mongoose.model("Counter", counterSchema);

placeSchema.pre("save", async function () {
  if (!this.isNew) return;

  const testVal = await CounterModel.increment("place");
  this._id = testVal;
});

export default mongoose.model<IPlace>("Place", placeSchema);
