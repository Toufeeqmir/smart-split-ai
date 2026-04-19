import Message from "../models/Message.js";
import Conversation from "../models/conversation.js";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const trimmedMessage = message?.trim();

    if (!trimmedMessage || !conversationId) {
      return res
        .status(400)
        .json({ error: "Message and conversationId are required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.members.includes(req.user.username)) {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    const newMessage = new Message({
      sender: req.user.username,
      message: trimmedMessage,
      conversationId,
      seenBy: [req.user.username],
    });

    await newMessage.save();
    await Conversation.findByIdAndUpdate(conversationId, {});

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.members.includes(req.user.username)) {
      return res.status(403).json({ error: "You are not a member of this conversation" });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
