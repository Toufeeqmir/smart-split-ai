// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import {React} from "react";
// import Dashboard from './pages/Dashboard';
// import Login from './pages/Login';
// import Chat from './pages/Chat';

// export default function App() {
//   return (
//     <>
//     <h1 className="text-3xl font-bold text-blue-500">
//   Tailwind is working 🚀
// </h1>
//     </>
//     // <BrowserRouter>
//     //   <Routes>
//     //     <Route path="/" element={<Dashboard />} />
//     //     <Route path="/login" element={<Login />} />
//     //     <Route path="/chat" element={<Chat />} />
//     //   </Routes>
//     // </BrowserRouter>
//   );
// }
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import socket from "./socket";

import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Conversations from "./pages/Conversations";
import Group from "./pages/Group";

function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user?.username) {
      return undefined;
    }

    const registerUser = () => {
      socket.emit("register_user", user.username);
    };

    if (socket.connected) {
      registerUser();
    }

    socket.on("connect", registerUser);

    return () => {
      socket.off("connect", registerUser);
    };
  }, [user?.username]);

  const routes = (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/chat/:id" element={<Chat />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/conversations" element={<Conversations />} />
      <Route path="/group" element={<Group />} />
    </Routes>
  );

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-7rem] top-[-10rem] h-72 w-72 rounded-full bg-brand-teal/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-10 h-64 w-64 rounded-full bg-brand-gold/20 blur-3xl" />
        <div className="absolute bottom-[-9rem] left-1/3 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen">
        <Navbar isAuthPage={isAuthPage} />

        <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          {isAuthPage ? (
            <main className="animate-fade-up py-4">{routes}</main>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <Sidebar />
              <main className="min-w-0 animate-fade-up pt-1">{routes}</main>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppLayout />
    </BrowserRouter>
  );
}
