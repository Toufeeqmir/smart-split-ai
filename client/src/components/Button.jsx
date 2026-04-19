import React from "react";

export default function Button({ text, onClick, type = "primary", disabled = false }) {
  const base =
    "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

  const styles = {
    primary:
      "bg-brand-ink text-white shadow-soft hover:-translate-y-0.5 hover:bg-brand-slate focus:ring-brand-teal/20",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300/50",
    danger:
      "bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-700 focus:ring-rose-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[type]} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {text}
    </button>
  );
}
