import React from "react";
import Avatar from "./Avatar";

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
  status = "",
  avatar = "",
  senderName = "",
  showSenderName = false,
}) {
  const statusIcon = (() => {
    if (!isOwnMessage || !status) {
      return null;
    }

    const strokeClassName =
      status === "seen" ? "stroke-sky-400" : "stroke-slate-500";
    const doubleCheck = status === "seen" || status === "delivered";

    return (
      <svg
        viewBox="0 0 20 20"
        className={`h-4 w-4 ${strokeClassName}`}
        fill="none"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M2.75 10.25 6.5 14l5.25-7" />
        {doubleCheck && <path d="M8.75 10.25 12.5 14l5.25-7" />}
      </svg>
    );
  })();

  return (
    <div
      className={`flex items-end gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && (
        <Avatar
          name={senderName || message.sender}
          src={avatar}
          size="sm"
          className="mb-1"
        />
      )}

      <div
        className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-soft ${
          isOwnMessage
            ? "rounded-br-md bg-[#d9fdd3] text-slate-900"
            : "rounded-bl-md border border-[#e6dfd6] bg-white text-slate-800"
        }`}
      >
        {!isOwnMessage && showSenderName && (
          <p className="mb-1 text-xs font-semibold text-brand-teal">
            {senderName || message.sender}
          </p>
        )}

        <p className="text-sm leading-relaxed break-words">{message.message}</p>

        <div
          className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${
            isOwnMessage ? "text-slate-500" : "text-slate-400"
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {statusIcon}
        </div>
      </div>
    </div>
  );
}
