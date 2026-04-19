import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: String, required: true },
    message: { type: String, required: true },
    seenBy: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
