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

  // 🟢 ADDED: users + selected members
  const [users, setUsers] = useState([]);        // ✅ NEW
  const [selected, setSelected] = useState([]);  // ✅ NEW

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

    // 🟢 ADDED: fetch users
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/auth/users"); // ✅ NEW
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGroups();
    fetchUsers(); // ✅ NEW
  }, []);

  // 🟢 ADDED: toggle selection
  const toggleUser = (username) => {
    setSelected((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

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
        members: selected, // 🔴 UPDATED (was [user.username])
      });

      setGroups((prev) => [data, ...prev]);
      setName("");
      setSelected([]); // ✅ reset selection
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
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel p-6 sm:p-7">
          <p className="soft-label">New group</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Create a conversation
          </h3>

          <div className="mt-6 space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className="form-input"
            />

            {/* 🟢 ADDED: User selection UI */}
            <div>
              <p className="text-sm font-semibold mb-2">Select Members</p>

              {users
                .filter((u) => u.username !== user.username)
                .map((u) => (
                  <div key={u._id}>
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => toggleUser(u.username)}
                      />
                      {u.username}
                    </label>
                  </div>
                ))}
            </div>

            <button
              onClick={createGroup}
              disabled={creating}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-ink px-4 py-3 text-sm font-semibold text-white"
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}
        </section>

        {/* EXISTING GROUPS */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Your groups</h3>

          {loading ? (
            <div>Loading groups...</div>
          ) : groups.length === 0 ? (
            <div>No groups yet</div>
          ) : (
            <div>
              {groups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => navigate(`/chat/${group._id}`)}
                  className="border p-3 mb-2 cursor-pointer"
                >
                  <strong>{group.name}</strong> ({group.members.length} members)
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}