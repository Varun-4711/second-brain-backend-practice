import mongoose,{Types} from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI as string;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.model("User", userSchema);

// Content schema and model
const contentTypes = ["image", "video", "article", "audio"];
const contentSchema = new mongoose.Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: "Tag" }],
  userId: { type: Types.ObjectId, ref: "User", required: true },
});

export const Content = mongoose.model("Content", contentSchema);

// Tag schema and model
const tagSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
});

export const Tag = mongoose.model("Tag", tagSchema);

