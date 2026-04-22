import React, { useState } from "react";

export default function MessageInput({ onSend, disabled = false }) {
  const [value, setValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedValue = value.trim();
    if (!trimmedValue || disabled) {
      return;
    }

    const wasSent = await onSend(trimmedValue);
    if (wasSent !== false) {
      setValue("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200/70 bg-white/90 px-4 py-3"
    >
      <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 px-3 py-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border-0 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-teal text-white transition hover:bg-brand-slate disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M3.4 20.4 21 12 3.4 3.6l.3 6.3L16 12 3.7 14.1l-.3 6.3Z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
