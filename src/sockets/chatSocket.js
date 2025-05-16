module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User is connected", socket.id);

    socket.on("join_room", (chatId) => {
      socket.join(chatId);
      console.log("Chat ID from F-e", chatId);
    });
    socket.on("leave_room", (chatId) => {
      socket.leave(chatId);
      console.log("Chat ID from F-e", chatId);
    });

    socket.on("send_message", (data) => {
      console.log("Message Data is available", data);
      io.to(data?.chatID).emit("send_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User is disconnected");
    });
  });
};
