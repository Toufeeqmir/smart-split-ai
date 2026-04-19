import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import api from "../services/api";
import socket from "../socket";

const formatHeaderSubtitle = (conversation, isOtherUserOnline) => {
  if (!conversation) return "";

  if (conversation.isGroup) {
    return `${conversation.members.length} participants`;
  }

  return isOtherUserOnline ? "Online" : "Offline";
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export default function Chat() {
  const { id: conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );
  const otherUser = conversation?.otherUser || "";
  const isOtherUserOnline = Boolean(
    otherUser && onlineUsers.includes(otherUser)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;

    const fetchChatData = async () => {
      try {
        setLoading(true);

        const [conversationRes, messagesRes] = await Promise.all([
          api.get(`/conversations/${conversationId}`),
          api.get(`/chat?conversationId=${conversationId}`),
        ]);

        if (!isMounted) return;

        setConversation(conversationRes.data);
        setMessages(messagesRes.data);
        setOnlineUsers([]);
        setError("");
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load this conversation."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchChatData();

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !user?.username) return undefined;

    socket.emit("join_conversation", {
      conversationId,
      username: user.username,
    });

    const handleReceiveMessage = (message) => {
      if (String(message.conversationId) !== String(conversationId)) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((item) => String(item._id) === String(message._id))) {
          return prev;
        }

        return [...prev, message];
      });

      if (message.sender !== user.username) {
        socket.emit("mark_seen", {
          conversationId,
          username: user.username,
        });
      }
    };

    const handleMessagesSeen = ({ conversationId: seenConversationId, messageIds, seenBy }) => {
      if (
        String(seenConversationId) !== String(conversationId) ||
        !Array.isArray(messageIds) ||
        !seenBy
      ) {
        return;
      }

      setMessages((prev) =>
        prev.map((message) =>
          messageIds.includes(String(message._id))
            ? {
                ...message,
                seenBy: Array.from(new Set([...(message.seenBy || []), seenBy])),
              }
            : message
        )
      );
    };

    const handleConversationPresence = ({
      conversationId: presenceConversationId,
      onlineUsers: nextOnlineUsers = [],
    }) => {
      if (String(presenceConversationId) !== String(conversationId)) {
        return;
      }

      setOnlineUsers(nextOnlineUsers);
    };

    const handlePresenceChanged = ({ username, isOnline }) => {
      if (!username) {
        return;
      }

      setOnlineUsers((prev) => {
        const alreadyIncluded = prev.includes(username);

        if (isOnline && !alreadyIncluded) {
          return [...prev, username];
        }

        if (!isOnline && alreadyIncluded) {
          return prev.filter((member) => member !== username);
        }

        return prev;
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_seen", handleMessagesSeen);
    socket.on("conversation_presence", handleConversationPresence);
    socket.on("presence_changed", handlePresenceChanged);

    return () => {
      socket.emit("leave_conversation", conversationId);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_seen", handleMessagesSeen);
      socket.off("conversation_presence", handleConversationPresence);
      socket.off("presence_changed", handlePresenceChanged);
    };
  }, [conversationId, user?.username]);

  const getMessageStatus = (message) => {
    if (!message || !otherUser || conversation?.isGroup) {
      return "";
    }

    if (message.seenBy?.includes(otherUser)) {
      return "Seen";
    }

    return isOtherUserOnline ? "Delivered" : "Sent";
  };

  const sendMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || !conversationId || !user?.username || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      socket.emit("send_message", {
        message: trimmedMessage,
        conversationId,
        sender: user.username,
      });

      setInput("");
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-130px)] min-h-[620px]">
      <div className="panel flex h-full flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-5 py-4 backdrop-blur">
          <Link
            to="/conversations"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Back
          </Link>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/12 font-semibold text-brand-teal">
            {getInitials(conversation?.displayName)}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">
            {conversation?.displayName || "Chat"}
          </h2>
          <p className="truncate text-sm text-slate-500">
              {formatHeaderSubtitle(conversation, isOtherUserOnline)}
            </p>
          </div>
        </div>

        <div
          className="flex-1 space-y-3 overflow-y-auto px-4 py-5"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(240,247,252,0.9)), radial-gradient(circle at 12% 20%, rgba(45,143,133,0.09), transparent 22%), radial-gradient(circle at 88% 12%, rgba(199,145,63,0.11), transparent 18%)",
          }}
        >
          {loading ? (
            <div className="inline-block rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-500">
              Loading chat...
            </div>
          ) : error ? (
            <div className="inline-block rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="inline-block rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-500">
              No messages yet. Say hello and start the conversation.
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message._id}
                message={message}
                isOwnMessage={message.sender === user?.username}
                statusLabel={
                  message.sender === user?.username
                    ? getMessageStatus(message)
                    : ""
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200/70 bg-white/85 px-4 py-4">
          <div className="flex items-end gap-3">
            <textarea
              rows={1}
              className="form-input max-h-32 flex-1 resize-none rounded-[24px] bg-slate-50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="rounded-[22px] bg-brand-ink px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-slate disabled:opacity-60"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
