import React from "react";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "you";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {message.text}
      </div>

    </div>
  );
}