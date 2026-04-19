import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ isAuthPage = false }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-ink text-sm font-semibold tracking-[0.22em] text-white shadow-soft">
            SS
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">
              SmartSplit <span className="text-brand-teal">AI</span>
            </p>
            <p className="hidden text-sm text-slate-500 sm:block">
              Collaborative expense tracking with cleaner conversations
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user?.username && (
            <div className="hidden rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-right shadow-sm md:block">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Active user
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {user.username}
              </p>
            </div>
          )}

          {!isAuthPage && (
            <Link
              to="/conversations"
              className="hidden rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-teal/40 hover:text-brand-teal md:inline-flex"
            >
              Messages
            </Link>
          )}

          <Link
            to={user ? "/" : "/login"}
            className="inline-flex rounded-2xl bg-brand-ink px-4 py-2.5 text-sm font-medium text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-slate"
          >
            {user ? (isAuthPage ? "Back to app" : "Dashboard") : "Login"}
          </Link>
        </div>
      </div>
    </header>
  );
}
