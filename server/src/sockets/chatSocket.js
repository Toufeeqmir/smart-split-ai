export const registerChatSocket = (io) =>{

  //every user gets a unique socket.id(this is like "user joined the chat")
   io.on("connection", (socket) =>{
     console.log("User connected:", socket.id);

     //Listens for message from frontend
     socket.on("send_message", (data) =>{
      //Sends message to all connected users 
      io.emit("receive_message", data);
     });

     socket.on("disconnect", () =>{
       console.log("User disconnected:", socket.id);
     });

   });
};