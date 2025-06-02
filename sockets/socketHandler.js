const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
      console.log(`${socket.id} joined room ${roomId}`);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ roomId, message }) => {
      console.log(`Message in ${roomId}: ${message}`);
      io.to(roomId).emit("message", {
        sender: socket.id,
        message,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = { initSocket };
