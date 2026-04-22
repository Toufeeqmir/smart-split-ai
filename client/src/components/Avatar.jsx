import React from "react";

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export default function Avatar({
  name = "",
  src = "",
  size = "md",
  className = "",
}) {
  const sizeClassName =
    {
      sm: "h-9 w-9 text-xs",
      md: "h-11 w-11 text-sm",
      lg: "h-14 w-14 text-base",
    }[size] || "h-11 w-11 text-sm";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Profile"}
        className={`rounded-full object-cover shadow-sm ${sizeClassName} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-brand-teal/12 font-semibold text-brand-teal shadow-sm ${sizeClassName} ${className}`}
      aria-label={name || "Profile"}
    >
      {getInitials(name)}
    </div>
  );
}
