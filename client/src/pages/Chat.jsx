import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../socket";
import Avatar from "../components/Avatar";
import ChatMessage from "../components/ChatMessage";
import MessageInput from "../features/chat/MessageInput";

const upsertMessage = (messages, nextMessage) => {
  const nextId = String(nextMessage._id);
  const existingIndex = messages.findIndex(
    (message) => String(message._id) === nextId
  );

  if (existingIndex === -1) {
    return [...messages, nextMessage].sort(
      (first, second) => new Date(first.createdAt) - new Date(second.createdAt)
    );
  }

  const updatedMessages = [...messages];
  updatedMessages[existingIndex] = {
    ...updatedMessages[existingIndex],
    ...nextMessage,
  };
  return updatedMessages;
};

const markMessagesSeen = (messages, messageIds, username) =>
  messages.map((message) =>
    messageIds.includes(String(message._id))
      ? {
          ...message,
          seenBy: Array.from(new Set([...(message.seenBy || []), username])),
        }
      : message
  );

const getOwnMessageStatus = (message, conversation, currentUsername) => {
  if (!conversation || !currentUsername || message.sender !== currentUsername) {
    return "";
  }

  if (conversation.isGroup) {
    const seenCount = (message.seenBy || []).filter(
      (username) => username !== currentUsername
    ).length;

    return seenCount > 0 ? "seen" : "sent";
  }

  const partnerUsername = conversation.otherMember?.username;

  if (partnerUsername && (message.seenBy || []).includes(partnerUsername)) {
    return "seen";
  }

  if (partnerUsername && conversation.onlineUsers?.includes(partnerUsername)) {
    return "delivered";
  }

  return "sent";
};

export default function Chat() {
  const { id } = useParams();
  const messagesEndRef = useRef(null);
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const markConversationAsSeen = async () => {
    if (!id || !user?.username) {
      return;
    }

    try {
      await api.post(`/chat/${id}/seen`);
      socket.emit("mark_seen", {
        conversationId: id,
        username: user.username,
      });
    } catch (err) {
      console.error("Seen update error:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [msgRes, convoRes] = await Promise.all([
          api.get(`/chat/${id}`),
          api.get(`/conversations/${id}`),
        ]);

        if (!isMounted) {
          return;
        }

        setMessages(msgRes.data || []);
        setConversation(convoRes.data || null);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Could not load this conversation."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!id || !user?.username) {
      return undefined;
    }

    socket.emit("join_conversation", {
      conversationId: id,
      username: user.username,
    });

    const handleReceiveMessage = (message) => {
      if (String(message.conversationId) !== String(id)) {
        return;
      }

      setMessages((currentMessages) => upsertMessage(currentMessages, message));

      if (message.sender !== user.username) {
        markConversationAsSeen();
      }
    };

    const handleMessagesSeen = ({ conversationId, messageIds, seenBy }) => {
      if (String(conversationId) !== String(id)) {
        return;
      }

      setMessages((currentMessages) =>
        markMessagesSeen(currentMessages, messageIds || [], seenBy)
      );
    };

    const handleConversationPresence = ({ conversationId, onlineUsers }) => {
      if (String(conversationId) !== String(id)) {
        return;
      }

      setConversation((currentConversation) =>
        currentConversation
          ? {
              ...currentConversation,
              onlineUsers: onlineUsers || [],
            }
          : currentConversation
      );
    };

    const handlePresenceChanged = ({ username, isOnline }) => {
      setConversation((currentConversation) => {
        if (
          !currentConversation ||
          !currentConversation.members?.includes(username)
        ) {
          return currentConversation;
        }

        const currentOnlineUsers = new Set(currentConversation.onlineUsers || []);

        if (isOnline) {
          currentOnlineUsers.add(username);
        } else {
          currentOnlineUsers.delete(username);
        }

        return {
          ...currentConversation,
          onlineUsers: Array.from(currentOnlineUsers),
        };
      });
    };

    const handleFocus = () => {
      markConversationAsSeen();
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_seen", handleMessagesSeen);
    socket.on("conversation_presence", handleConversationPresence);
    socket.on("presence_changed", handlePresenceChanged);
    window.addEventListener("focus", handleFocus);

    markConversationAsSeen();

    return () => {
      socket.emit("leave_conversation", id);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_seen", handleMessagesSeen);
      socket.off("conversation_presence", handleConversationPresence);
      socket.off("presence_changed", handlePresenceChanged);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id, user?.username]);

  const sendMessage = async (nextMessage) => {
    try {
      setSending(true);
      setError("");

      const { data } = await api.post("/chat", {
        message: nextMessage,
        conversationId: id,
      });

      setMessages((currentMessages) => upsertMessage(currentMessages, data));
      return true;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not send the message."
      );
      return false;
    } finally {
      setSending(false);
    }
  };

  const partner = conversation?.otherMember;
  const partnerOnline =
    !conversation?.isGroup &&
    partner?.username &&
    conversation?.onlineUsers?.includes(partner.username);

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-panel">
      <div className="border-b border-slate-200/70 bg-white/95 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/conversations"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-teal/30 hover:text-brand-teal"
            >
              Back
            </Link>
            <div className="relative">
              <Avatar
                name={conversation?.displayName || "Chat"}
                src={conversation?.avatar}
                size="md"
              />
              {partnerOnline && (
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">
                {conversation?.displayName || "Conversation"}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {conversation?.isGroup
                  ? `${conversation?.members?.length || 0} members in this room`
                  : partner?.username
                    ? partnerOnline
                      ? `@${partner.username} is online`
                      : `@${partner.username}`
                    : "Private chat"}
              </p>
            </div>
          </div>
          <div className="hidden rounded-full bg-brand-teal/10 px-3 py-1.5 text-xs font-semibold text-brand-teal sm:block">
            {conversation?.isGroup ? "Group" : "Private"}
          </div>
        </div>
      </div>

      <div className="chat-wallpaper flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {loading ? (
          <div className="mx-auto max-w-md rounded-[24px] bg-white/90 px-4 py-5 text-center text-sm text-slate-500 shadow-soft">
            Loading conversation...
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-5 text-center text-sm text-rose-700">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto max-w-md rounded-[24px] bg-white/90 px-4 py-5 text-center text-sm text-slate-500 shadow-soft">
            No messages yet. Start the conversation.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                isOwnMessage={message.sender === user?.username}
                status={getOwnMessageStatus(message, conversation, user?.username)}
                avatar={
                  conversation?.memberProfiles?.find(
                    (member) => member.username === message.sender
                  )?.avatar || ""
                }
                senderName={message.sender}
                showSenderName={Boolean(conversation?.isGroup)}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={sendMessage} disabled={sending || loading} />
    </div>
  );
}
