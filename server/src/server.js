import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { registerChatSocket } from './sockets/chatSocket.js';
import dotenv from "dotenv";
dotenv.config();

 const PORT = process.env.PORT || 5000;

 //create HTTP server
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: {
   origin: "http://localhost:5173", 
   methods: ["GET", "POST"]
  } });

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
