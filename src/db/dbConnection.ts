import mongoose from "mongoose";
import { config } from "dotenv";

config();

async function connect_to_db() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongo");
  } catch (error) {
    console.error(error);
  }
}

export default connect_to_db;
