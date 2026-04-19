import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    description: "Track balances and shared activity",
    icon: (
      <path
        d="M3.75 4.5h6.75v6.75H3.75V4.5Zm9.75 0h6.75v4.5H13.5V4.5Zm0 7.5h6.75v7.5H13.5V12Zm-9.75 2.25h6.75v5.25H3.75v-5.25Z"
        fill="currentColor"
      />
    ),
  },
  {
    to: "/conversations",
    label: "Conversations",
    description: "Private chats and live threads",
    icon: (
      <path
        d="M4.5 5.25A2.25 2.25 0 0 1 6.75 3h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 17.25 15H9.621l-3.933 3.145A.75.75 0 0 1 4.5 17.56V5.25Z"
        fill="currentColor"
      />
    ),
  },
  {
    to: "/group",
    label: "Groups",
    description: "Organize recurring shared rooms",
    icon: (
      <path
        d="M9 6.75A2.25 2.25 0 1 1 4.5 6.75 2.25 2.25 0 0 1 9 6.75Zm10.5 0A2.25 2.25 0 1 1 15 6.75a2.25 2.25 0 0 1 4.5 0ZM12 11.25A2.625 2.625 0 1 1 6.75 11.25 2.625 2.625 0 0 1 12 11.25ZM3 18a3 3 0 0 1 3-3h1.072a4.48 4.48 0 0 0 5.856 0H14a3 3 0 0 1 3 3v.75H3V18Zm15 0a3 3 0 0 0-2.086-2.85A4.476 4.476 0 0 1 17.25 12a2.25 2.25 0 1 1 4.5 0c0 1.343-.64 2.536-1.636 3.353A3 3 0 0 1 21 18v.75h-3V18Z"
        fill="currentColor"
      />
    ),
  },
  {
    to: "/login",
    label: "Login",
    description: "Access your workspace securely",
    icon: (
      <path
        d="M10.5 3.75A2.25 2.25 0 0 1 12.75 1.5h5.25a2.25 2.25 0 0 1 2.25 2.25v16.5A2.25 2.25 0 0 1 18 22.5h-5.25a2.25 2.25 0 0 1-2.25-2.25v-2.25a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 0 .75.75H18a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 18 3h-5.25a.75.75 0 0 0-.75.75V6a.75.75 0 0 1-1.5 0V3.75Z"
        fill="currentColor"
      />
    ),
  },
  {
    to: "/register",
    label: "Register",
    description: "Create an account for your team",
    icon: (
      <path
        d="M12 4.5a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5ZM5.25 18a5.25 5.25 0 0 1 10.5 0v.75H5.25V18Zm12-6.75a.75.75 0 0 1 .75-.75h1.5V9a.75.75 0 0 1 1.5 0v1.5h1.5a.75.75 0 0 1 0 1.5H21v1.5a.75.75 0 0 1-1.5 0V12h-1.5a.75.75 0 0 1-.75-.75Z"
        fill="currentColor"
      />
    ),
  },
];

function NavGlyph({ children }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        {children}
      </svg>
    </span>
  );
}

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <aside className="panel h-fit overflow-hidden lg:sticky lg:top-24">
      <div className="border-b border-slate-200/70 bg-gradient-to-br from-brand-ink via-brand-slate to-slate-900 px-5 py-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
          Workspace
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          Keep every bill, balance, and message aligned.
        </h2>
        <p className="mt-2 text-sm text-white/72">
          Move between expenses and conversations without losing context.
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">
            Signed in
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {user?.username || "Guest workspace"}
          </p>
        </div>
      </div>

      <nav className="flex gap-3 overflow-x-auto px-4 py-4 lg:flex-col lg:overflow-visible">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group min-w-[232px] rounded-[22px] border px-4 py-4 text-left transition lg:min-w-0 ${
                isActive
                  ? "border-brand-teal/30 bg-brand-teal/10 text-brand-slate shadow-soft"
                  : "border-transparent bg-white/70 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-start gap-3">
                <span
                  className={`${
                    isActive
                      ? "text-brand-teal"
                      : "text-slate-500 group-hover:text-brand-slate"
                  }`}
                >
                  <NavGlyph>{item.icon}</NavGlyph>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p
                    className={`mt-1 text-sm ${
                      isActive ? "text-slate-600" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
