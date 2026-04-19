import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const formatConversationTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingChatWith, setStartingChatWith] = useState("");

  const navigate = useNavigate();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [conversationsRes, usersRes] = await Promise.all([
          api.get("/conversations"),
          api.get("/auth/users"),
        ]);

        if (!isMounted) return;

        setConversations(conversationsRes.data);
        setUsers(usersRes.data);
        setError("");
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load chats."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    const intervalId = setInterval(loadData, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((person) =>
      person.username.toLowerCase().includes(normalizedSearch)
    );
  }, [search, users]);

  const startPrivateChat = async (receiverUsername) => {
    try {
      setStartingChatWith(receiverUsername);
      setError("");

      const res = await api.post("/conversations/private", {
        receiver: receiverUsername,
      });

      const newConversation = res.data;

      setConversations((prev) => {
        const next = prev.filter(
          (conversation) => conversation._id !== newConversation._id
        );
        return [newConversation, ...next];
      });

      navigate(`/chat/${newConversation._id}`);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not start private chat."
      );
    } finally {
      setStartingChatWith("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel px-6 py-7 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="soft-label">Communication hub</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-950">
              Coordinate expenses through private chats and group rooms.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Start a new conversation with anyone in the workspace and keep a
              running view of your recent threads.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] bg-slate-900 px-5 py-4 text-white shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Active user
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {user?.username || "Guest"}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="soft-label">Users</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {users.length}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="soft-label">Conversations</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {conversations.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid h-[calc(100vh-340px)] min-h-[620px] gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="panel overflow-hidden">
          <div className="border-b border-slate-200/70 bg-gradient-to-br from-brand-teal/8 to-white p-5">
            <h2 className="text-2xl font-semibold text-slate-900">Start a chat</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search people and open a private conversation instantly.
            </p>

            <div className="mt-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by username"
                className="form-input bg-white"
              />
            </div>
          </div>

          <div className="h-[calc(100%-145px)] space-y-3 overflow-y-auto p-4">
            {loading ? (
              <div className="text-sm text-slate-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-sm text-slate-500">
                No users found. Ask another person to register first.
              </div>
            ) : (
              filteredUsers.map((person) => (
                <button
                  key={person._id}
                  onClick={() => startPrivateChat(person.username)}
                  disabled={startingChatWith === person.username}
                  className="w-full rounded-[22px] border border-slate-100 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-brand-teal/30 hover:bg-brand-teal/5 disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-teal/10 font-semibold text-brand-teal">
                      {getInitials(person.username)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {person.username}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {person.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="panel flex flex-col overflow-hidden">
          <div className="border-b border-slate-200/70 bg-gradient-to-br from-white to-brand-teal/8 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Recent conversations
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Logged in as {user?.username || "Guest"}
                </p>
              </div>
              <button
                onClick={() => navigate("/group")}
                className="rounded-2xl bg-brand-ink px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-slate"
              >
                New group
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-white/70 bg-white px-4 py-6 text-sm text-slate-500">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="rounded-2xl border border-white/70 bg-white px-4 py-6 text-sm text-slate-500">
                No conversations yet. Pick a user on the left and start chatting.
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  onClick={() => navigate(`/chat/${conversation._id}`)}
                  className="w-full rounded-[24px] border border-slate-100 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-teal/25 hover:shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                      {getInitials(conversation.displayName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-semibold text-slate-900">
                          {conversation.displayName}
                        </p>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatConversationTime(
                            conversation.lastMessage?.createdAt || conversation.updatedAt
                          )}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {conversation.lastMessage
                          ? `${conversation.lastMessage.sender}: ${conversation.lastMessage.message}`
                          : conversation.isGroup
                            ? `${conversation.members.length} members`
                            : "Tap to start chatting"}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
