import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Group() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data } = await api.get("/conversations");
        setGroups(data.filter((conversation) => conversation.isGroup));
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load groups. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const createGroup = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a group name.");
      return;
    }

    if (!user?.username) {
      setError("Please log in again before creating a group.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const { data } = await api.post("/conversations/group", {
        name: trimmedName,
        members: [user.username],
      });

      setGroups((prev) => [data, ...prev]);
      setName("");
      navigate(`/chat/${data._id}`);
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not create the group. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel px-6 py-7 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="soft-label">Group spaces</p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-950">
              Create focused rooms for trips, house shares, and recurring costs.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Group conversations keep the right people around the right expenses,
              making follow-up and settlement simpler.
            </p>
          </div>

          <div className="rounded-[28px] bg-slate-900 px-6 py-6 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Current owner
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {user?.username || "Guest"}
            </p>
            <p className="mt-3 text-sm text-white/72">
              New groups will be created under your account and opened right away.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel p-6 sm:p-7">
          <p className="soft-label">New group</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Create a conversation
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Name the group and start chatting right away.
          </p>

          <div className="mt-6 space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className="form-input"
            />
            <button
              onClick={createGroup}
              disabled={creating}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-ink px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-slate disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <p className="soft-label">Existing rooms</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              Your groups
            </h3>
          </div>

          {loading ? (
            <div className="panel px-6 py-8 text-sm text-slate-500">
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="panel px-6 py-8 text-sm text-slate-500">
              No groups yet. Create your first one above.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => navigate(`/chat/${group._id}`)}
                  className="panel p-5 text-left transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="soft-label">Group room</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">
                        {group.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
                      {group.members?.length || 0} member
                      {group.members?.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-500">
                    Open this room to continue planning, tracking, and settling
                    shared expenses.
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
