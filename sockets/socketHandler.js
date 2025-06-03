const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", process.env.FRONTEND_URL],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    let rooms = []; // memoria compartida para rooms (solo temporal, usar DB en producción)

    socket.on("createRoom", (room) => {
      console.log("Room created:", room);
      rooms.push(room);
      io.emit("newRoom", room); // Emite a todos los clientes conectados
    });

    // Envía rooms actuales al nuevo cliente
    socket.emit("initialRooms", rooms);

    socket.on("joinRoom", (roomId) => {
      console.log(`${socket.id} joined room ${roomId}`);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ roomId, sender, message }) => {
      console.log(`Message in ${roomId} from ${sender}: ${message}`);
      io.to(roomId).emit("message", {
        sender,
        message,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = { initSocket };
