import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="h-14 flex items-center justify-between px-6 bg-white border-b shadow-sm">
      <h1 className="text-lg font-bold text-gray-800">
        SmartSplit <span className="text-blue-500">AI</span>
      </h1>

      <Link to="/login">
        <button className="bg-blue-500 text-white px-4 py-1.5 rounded-lg hover:bg-blue-600">
          Login
        </button>
      </Link>
    </div>
  );
}