const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app); // Use http server for Socket.IO

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());

const allowedOrigin = process.env.FRONTEND_URL || "";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("https://localhost") ||
        origin === allowedOrigin
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

// Routers
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const usersRouter = require("./routes/user");
const verifyToken = require("./middleware/verifyToken");

// Public routes
app.use("/register", registerRouter);
app.use("/login", loginRouter);

// Protected routes
app.use("/users", verifyToken, usersRouter);

// inside your Socket.IO setup
io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    console.log(`Socket ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    console.log(`Message in room ${roomId}: ${message}`);
    io.to(roomId).emit("message", {
      sender: socket.id,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
