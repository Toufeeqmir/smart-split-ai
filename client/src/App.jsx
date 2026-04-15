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
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-100 min-h-screen">
        <Navbar />

        <div className="flex">
          <Sidebar />

          <div className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}