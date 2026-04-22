import Conversation from "../models/conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { getOnlineMembers } from "../sockets/chatSocket.js";

const formatConversation = async (conversation, currentUsername) => {
  const plainConversation =
    typeof conversation.toObject === "function"
      ? conversation.toObject()
      : conversation;

  const members = await User.find({
    username: { $in: plainConversation.members },
  })
    .select("username email avatar")
    .lean();

  const memberMap = new Map(
    members.map((member) => [
      member.username,
      {
        username: member.username,
        email: member.email,
        avatar: member.avatar || "",
      },
    ])
  );

  const lastMessage = await Message.findOne({
    conversationId: plainConversation._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  const otherUser =
    plainConversation.members.find((member) => member !== currentUsername) || null;
  const otherMember = otherUser
    ? memberMap.get(otherUser) || {
        username: otherUser,
        email: "",
        avatar: "",
      }
    : null;

  return {
    ...plainConversation,
    otherUser,
    otherMember,
    avatar: plainConversation.isGroup ? "" : otherMember?.avatar || "",
    memberProfiles: plainConversation.members.map(
      (member) =>
        memberMap.get(member) || {
          username: member,
          email: "",
          avatar: "",
        }
    ),
    displayName: plainConversation.isGroup
      ? plainConversation.name
      : otherMember?.username || otherUser || "Direct chat",
    onlineUsers: getOnlineMembers(plainConversation),
    lastMessage: lastMessage
      ? {
          _id: lastMessage._id,
          sender: lastMessage.sender,
          message: lastMessage.message,
          createdAt: lastMessage.createdAt,
          seenBy: lastMessage.seenBy || [],
        }
      : null,
  };
};

// Create or get one-to-one chat
export const createOrGetConversation = async (req, res) => {
  try {
    const receiver = req.body.receiver?.trim();

    if (!receiver) {
      return res.status(400).json({ error: "Receiver username is required" });
    }

    if (receiver === req.user.username) {
      return res.status(400).json({ error: "You cannot start a chat with yourself" });
    }

    const receiverUser = await User.findOne({ username: receiver });

    if (!receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [req.user.username, receiver] },
      isGroup: false,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user.username, receiver],
        isGroup: false,
      });
    }

    res.json(await formatConversation(conversation, req.user.username));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create group chat
export const createGroupConversation = async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    const uniqueMembers = [...new Set([req.user.username, ...members])];

    if (!name?.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const group = await Conversation.create({
      name: name.trim(),
      members: uniqueMembers,
      isGroup: true,
    });

    console.log("BODY", req.body);
    console.log("MEMBERS", members);

    res.status(201).json(await formatConversation(group, req.user.username));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all user conversations
export const getUserConversations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const conversations = await Conversation.find({
      members: req.user.username,
    }).sort({ updatedAt: -1 });

    const formattedConversations = await Promise.all(
      conversations.map((conversation) =>
        formatConversation(conversation, req.user.username)
      )
    );

    res.json(formattedConversations);
  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get a single conversation
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.members.includes(req.user.username)) {
      return res.status(403).json({ error: "Not authorized to access this conversation" });
    }

    res.json(await formatConversation(conversation, req.user.username));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
