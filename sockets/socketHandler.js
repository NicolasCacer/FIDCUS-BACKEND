const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { fetchRooms } = require("../controllers/rooms");
dotenv.config();

let rooms = [];

async function loadRoomsFromDB() {
  try {
    rooms = await fetchRooms();
    console.log("Rooms loaded from DB:", rooms);
  } catch (err) {
    console.error("Error loading rooms from DB:", err);
  }
}

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", process.env.FRONTEND_URL],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  loadRoomsFromDB();

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.emit("initialRooms", rooms);

    socket.on("createRoom", (room) => {
      console.log("Room created:", room);
      rooms.push(room);
      io.emit("newRoom", room);
    });

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
