import { io } from "socket.io-client";

const socketBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(
  /\/api$/,
  ""
);

const socket = io(socketBaseUrl, {
transports : ["websocket"], //optional but stable
});


export default socket;
