import Message from "../models/Message.js";
import Conversation from "../models/conversation.js";

const onlineUsers = new Map();

const getConversationId = (payload) =>
  typeof payload === "string" ? payload : payload?.conversationId;

const getUsername = (socket, payload) => {
  if (typeof payload === "string") {
    return socket.data.username || payload;
  }

  return payload?.username || socket.data.username;
};

const addOnlineUser = (username, socketId) => {
  const existingSockets = onlineUsers.get(username) || new Set();
  const wasOnline = existingSockets.size > 0;

  existingSockets.add(socketId);
  onlineUsers.set(username, existingSockets);

  return !wasOnline;
};

const removeOnlineUser = (username, socketId) => {
  if (!username || !onlineUsers.has(username)) {
    return false;
  }

  const existingSockets = onlineUsers.get(username);
  existingSockets.delete(socketId);

  if (existingSockets.size === 0) {
    onlineUsers.delete(username);
    return true;
  }

  onlineUsers.set(username, existingSockets);
  return false;
};

const isUserOnline = (username) =>
  Boolean(username && onlineUsers.has(username) && onlineUsers.get(username).size > 0);

const getOnlineMembers = (conversation) =>
  conversation.members.filter((member) => isUserOnline(member));

const markConversationMessagesSeen = async (io, conversationId, username) => {
  if (!conversationId || !username) {
    return null;
  }

  const conversation = await Conversation.findById(conversationId).lean();

  if (!conversation || !conversation.members.includes(username)) {
    return null;
  }

  const unseenMessages = await Message.find({
    conversationId,
    sender: { $ne: username },
    seenBy: { $ne: username },
  })
    .select("_id")
    .lean();

  if (unseenMessages.length > 0) {
    const messageIds = unseenMessages.map((message) => message._id);

    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { seenBy: username } }
    );

    io.to(conversationId).emit("messages_seen", {
      conversationId: String(conversationId),
      messageIds: messageIds.map(String),
      seenBy: username,
    });
  }

  io.to(conversationId).emit("conversation_presence", {
    conversationId: String(conversationId),
    onlineUsers: getOnlineMembers(conversation),
  });

  return conversation;
};

export const registerChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("register_user", (rawUsername) => {
      const username = rawUsername?.trim();

      if (!username) {
        return;
      }

      if (socket.data.username && socket.data.username !== username) {
        const becameOffline = removeOnlineUser(socket.data.username, socket.id);

        if (becameOffline) {
          io.emit("presence_changed", {
            username: socket.data.username,
            isOnline: false,
          });
        }

        socket.leave(`user:${socket.data.username}`);
      }

      socket.data.username = username;
      socket.join(`user:${username}`);

      const becameOnline = addOnlineUser(username, socket.id);

      if (becameOnline) {
        io.emit("presence_changed", {
          username,
          isOnline: true,
        });
      }
    });

    socket.on("join_conversation", async (payload) => {
      const conversationId = getConversationId(payload);
      const username = getUsername(socket, payload)?.trim();

      if (conversationId) {
        socket.join(conversationId);
      }

      if (!username || !conversationId) {
        return;
      }

      if (!socket.data.username) {
        socket.data.username = username;
        socket.join(`user:${username}`);

        const becameOnline = addOnlineUser(username, socket.id);

        if (becameOnline) {
          io.emit("presence_changed", {
            username,
            isOnline: true,
          });
        }
      }

      try {
        await markConversationMessagesSeen(io, conversationId, username);
      } catch (err) {
        console.log("Join conversation error", err.message);
      }
    });

    socket.on("leave_conversation", (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId);
      }
    });

    socket.on("mark_seen", async (payload) => {
      const conversationId = getConversationId(payload);
      const username = getUsername(socket, payload)?.trim();

      try {
        await markConversationMessagesSeen(io, conversationId, username);
      } catch (err) {
        console.log("Seen status error", err.message);
      }
    });

    socket.on("send_message", async (data) => {
      try {
        const trimmedMessage = data.message?.trim();
        const { conversationId, sender } = data;

        if (!trimmedMessage || !sender || !conversationId) {
          return;
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation || !conversation.members.includes(sender)) {
          return;
        }

        const newMessage = await Message.create({
          message: trimmedMessage,
          conversationId,
          sender,
          seenBy: [sender],
        });

        await Conversation.findByIdAndUpdate(conversationId, {});

        io.to(conversationId).emit("receive_message", newMessage);
      } catch (err) {
        console.log("Socket Error", err.message);
      }
    });

    socket.on("disconnect", () => {
      const username = socket.data.username;
      const becameOffline = removeOnlineUser(username, socket.id);

      if (becameOffline) {
        io.emit("presence_changed", {
          username,
          isOnline: false,
        });
      }

      console.log("User disconnected :", socket.id);
    });
  });
};
