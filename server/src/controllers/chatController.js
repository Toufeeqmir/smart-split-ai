import Message from "../models/Message.js";
import Conversation from "../models/conversation.js";
import { getOnlineMembers } from "../sockets/chatSocket.js";

const getConversationIdFromRequest = (req) =>
  req.params.conversationId || req.query.conversationId || req.body.conversationId;

const markMessagesSeenForUser = async (conversationId, username) => {
  const unseenMessages = await Message.find({
    conversationId,
    sender: { $ne: username },
    seenBy: { $ne: username },
  })
    .select("_id")
    .lean();

  if (unseenMessages.length === 0) {
    return [];
  }

  const messageIds = unseenMessages.map((message) => message._id);

  await Message.updateMany(
    { _id: { $in: messageIds } },
    { $addToSet: { seenBy: username } }
  );

  return messageIds;
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const trimmedMessage = message?.trim();

    //Trim: removes extraspace fro end and starting of the string
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
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { updatedAt: new Date() },
    });

    const io = req.app.get("io");
    const serializedMessage =
      typeof newMessage.toObject === "function" ? newMessage.toObject() : newMessage;

    io?.to(conversationId).emit("receive_message", serializedMessage);
    io?.to(conversationId).emit("conversation_presence", {
      conversationId: String(conversationId),
      onlineUsers: getOnlineMembers(conversation),
    });

    res.status(201).json(serializedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const conversationId = getConversationIdFromRequest(req);

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

export const markConversationSeen = async (req, res) => {
  try {
    const conversationId = getConversationIdFromRequest(req);

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

    const messageIds = await markMessagesSeenForUser(conversationId, req.user.username);
    const io = req.app.get("io");

    if (messageIds.length > 0) {
      io?.to(conversationId).emit("messages_seen", {
        conversationId: String(conversationId),
        messageIds: messageIds.map(String),
        seenBy: req.user.username,
      });
    }

    io?.to(conversationId).emit("conversation_presence", {
      conversationId: String(conversationId),
      onlineUsers: getOnlineMembers(conversation),
    });

    res.status(200).json({
      success: true,
      messageIds: messageIds.map(String),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
