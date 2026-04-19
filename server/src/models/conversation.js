import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: String, required: true }], // usernames
    isGroup: { type: Boolean, default: false },
    name: { type: String }, // only for group
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);