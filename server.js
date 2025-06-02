const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./sockets/socketHandler");
const allowedOrigin = process.env.FRONTEND_URL || "";
const app = express();
const server = http.createServer(app);
dotenv.config();

app.use(express.json());
app.use(cookieParser());
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
const logoutRouter = require("./routes/logout");
const verifyToken = require("./middleware/verifyToken");

// Public routes
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);

// Protected routes
app.use("/users", verifyToken, usersRouter);

// inside your Socket.IO setup
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
