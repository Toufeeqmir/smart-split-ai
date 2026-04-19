import React from "react";

const formatTime = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatMessage({
  message,
  isOwnMessage,
  statusLabel = "",
}) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-soft ${
          isOwnMessage
            ? "rounded-br-md bg-brand-ink text-white"
            : "rounded-bl-md border border-white/70 bg-white/90 text-slate-800"
        }`}
      >
        {!isOwnMessage && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {message.sender}
          </p>
        )}
        <p className="text-sm leading-relaxed break-words">{message.message}</p>
        <p
          className={`mt-2 text-[11px] ${
            isOwnMessage ? "text-white/55" : "text-slate-400"
          }`}
        >
          {formatTime(message.createdAt)}
          {statusLabel ? ` · ${statusLabel}` : ""}
        </p>
      </div>
    </div>
  );
}
