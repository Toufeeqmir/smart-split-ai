import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import Avatar from "./Avatar";
import { fileToProfileDataUrl } from "../utils/profileImage";

export default function Navbar({ isAuthPage = false }) {
  const location = useLocation();
  const chatMatch = location.pathname.match(/^\/chat\/([^/]+)$/);
  const conversationId = chatMatch ? chatMatch[1] : "";
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")
  );
  const [chatPartner, setChatPartner] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };

    syncUser();
    window.addEventListener("user-updated", syncUser);

    return () => {
      window.removeEventListener("user-updated", syncUser);
    };
  }, [location.pathname]);

  useEffect(() => {
    const isOnChatPage = Boolean(conversationId);

    if (!isOnChatPage) {
      setChatPartner(null);
      return;
    }

    const fetchChatPartner = async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}`);
        setChatPartner(res.data);
      } catch (err) {
        console.error("Error fetching chat partner for navbar:", err);
      }
    };

    fetchChatPartner();
  }, [conversationId, location.pathname]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const avatar = await fileToProfileDataUrl(file);
      const { data } = await api.patch("/auth/me", { avatar });

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      window.dispatchEvent(new Event("user-updated"));
    } catch (err) {
      console.error("Avatar update failed:", err);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto grid h-full max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold tracking-widest text-white">
            SS
          </div>
          <p className="hidden text-lg font-bold text-slate-900 lg:block">
            SmartSplit <span className="text-teal-600">AI</span>
          </p>
        </Link>

        {chatPartner && !isAuthPage ? (
          <div className="flex min-w-0 items-center justify-center gap-3 animate-fade-up">
            <Avatar
              name={chatPartner.displayName || "Chat"}
              src={chatPartner.avatar || chatPartner.otherMember?.avatar}
            />
            <div className="min-w-0 text-center">
              <h2 className="truncate text-sm font-bold leading-tight text-slate-800 sm:text-base">
                {chatPartner.displayName || "Chat"}
              </h2>
              <p className="truncate text-[11px] font-medium leading-tight text-brand-teal">
                {chatPartner.isGroup
                  ? `${chatPartner.members?.length || 0} members`
                  : chatPartner.otherMember?.username
                    ? `@${chatPartner.otherMember.username}`
                    : "Private chat"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-3">
          {user?.username && !isAuthPage && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-2 pr-2 py-2">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="rounded-full transition hover:scale-[1.03] disabled:opacity-60"
                title="Upload profile photo"
              >
                <Avatar name={user.username} src={user.avatar} size="sm" />
              </button>
              <div className="min-w-0">
                <p className="max-w-[120px] truncate text-xs font-semibold text-slate-700">
                  {user.username}
                </p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="text-[10px] font-medium text-brand-teal disabled:opacity-60"
                >
                  {isUploadingAvatar ? "Updating..." : "Change photo"}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          <Link
            to={user ? "/" : "/login"}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-md transition-all hover:bg-slate-800"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
        </div>
      </div>
    </header>
  );
}
