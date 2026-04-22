import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { registerChatSocket } from './sockets/chatSocket.js';
import dotenv from "dotenv";
dotenv.config();

 const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

 //create HTTP server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

  //Register socket events
registerChatSocket(io);


connectDB().then(() =>{
   httpServer.listen(PORT, () =>{
     console.log(`Server running on port ${PORT}`);
   });

})
.catch((err) => {
   console.error("DB connection failed", err);

});
