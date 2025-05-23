module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User is connected", socket.id);

    socket.on("join_room", (chatId) => {
      socket.join(chatId);
      console.log("Server is joining the room", chatId);
    });
    socket.on("leave_room", (chatId) => {
      socket.leave(chatId);
      console.log("Server is leaving the room ", chatId);
    });

    socket.on("join_chat", (userId) => {
      socket.join(userId);
      console.log("Server is joining the dasdasadroom", userId);
    });
    socket.on("leave_chat", (userId) => {
      socket.leave(userId);
      // console.log("Server is leaving the room ", chatId);
    });

    socket.on("send_message", (data) => {
      console.log("Message Data is available", data);
      io.to(data?.chatID).emit("send_message", data);
      io.to(data?.userId).emit("new_chat", data.chatUpdate);
    });

    socket.on("disconnect", () => {
      console.log("User is disconnected");
    });
  });
};
