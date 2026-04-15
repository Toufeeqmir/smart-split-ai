import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-60 bg-white border-r h-[calc(100vh-56px)] p-4">
      <ul className="space-y-2">
           <li>
             <NavLink
           to="/"
            className={({isActive}) =>
             `block p-2 rounded transition ${
              isActive 
              ? "bg-blue-500 text-white font-medium"
              : "text-gray-600 hover:bg-blue-50"
             }`}
>
       Dashboard
</NavLink>

           </li>
          
        <li>
          <NavLink to="/chat" 
          className= {({isActive}) =>
          `block p-2 rounded transition ${
            isActive
            ? "bg-blue-500 text-white font-medium"
            : "text-gray-600 hover:bg-blue-50"
          }`}>
            Chat
          </NavLink>
        </li>

        <li>
            <NavLink to="/chat" 
          className= {({isActive}) =>
          `block p-2 rounded transition ${
            isActive
            ? "bg-blue-500 text-white font-medium"
            : "text-gray-600 hover:bg-blue-50"
          }`}>
            Login
          </NavLink>
        </li>
      </ul>
    </div>
  );
}