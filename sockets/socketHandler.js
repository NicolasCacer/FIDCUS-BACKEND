const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { fetchRooms } = require("../controllers/rooms");

dotenv.config();

let rooms = [];
const games = {}; // Mapa: roomId -> { board, currentTurn, winner, players: { socketId: color } }

async function loadRoomsFromDB() {
  try {
    rooms = await fetchRooms();
    console.log("Rooms loaded from DB:", rooms);
  } catch (err) {
    console.error("Error loading rooms from DB:", err);
  }
}

function generateEmptyBoard() {
  const BOARD_SIZE = 5;
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ value: 0, color: null }))
  );
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function propagate(x, y, board, color, emitExploding) {
  const MAX_VALUE = 3;
  const BOARD_SIZE = 5;
  const queue = [{ x, y }];

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    const cell = board[y][x];

    if (cell.value > MAX_VALUE) {
      const cellId = `${x}-${y}`;
      emitExploding(cellId);

      await delay(50); // delay para animación

      cell.value = 0;
      cell.color = null;

      const directions = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ];

      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
          const neighbor = board[ny][nx];
          neighbor.value += 1;
          neighbor.color = color;

          if (neighbor.value > MAX_VALUE) {
            queue.push({ x: nx, y: ny });
          }
        }
      }

      await delay(50);
    }
  }
}

function checkWinner(board) {
  const flat = board.flat();
  const occupied = flat.filter((cell) => cell.color !== null && cell.value > 0);
  if (occupied.length <= 1) return null;

  const firstColor = occupied[0].color;
  const allSame = occupied.every(
    (cell) => cell.color === firstColor && cell.value > 0
  );

  return allSame ? firstColor : null;
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
    console.log("✅ New client connected:", socket.id);
    socket.emit("initialRooms", rooms);

    // Crear sala
    socket.on("createRoom", (room) => {
      rooms.push(room);
      io.emit("newRoom", room);
    });

    // Unirse a sala
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`👥 ${socket.id} joined room ${roomId}`);

      if (!games[roomId]) {
        games[roomId] = {
          board: generateEmptyBoard(),
          currentTurn: "red",
          winner: null,
          players: {},
        };
      }

      const game = games[roomId];

      // Asignar color al jugador si no tiene
      if (!game.players[socket.id]) {
        const assignedColor = Object.values(game.players).includes("red")
          ? "blue"
          : "red";
        game.players[socket.id] = assignedColor;
        socket.emit("assignedColor", assignedColor);
      } else {
        socket.emit("assignedColor", game.players[socket.id]);
      }

      // Enviar estado actual del juego
      socket.emit("gameState", {
        board: game.board,
        currentTurn: game.currentTurn,
        winner: game.winner,
      });
    });

    // Movimiento del jugador
    socket.on("makeMove", async ({ roomId, x, y }) => {
      const game = games[roomId];
      if (!game || game.winner) return;

      const playerColor = game.players[socket.id];
      if (!playerColor || playerColor !== game.currentTurn) return;

      const board = game.board;
      const cell = board[y][x];

      // Validar movimiento
      if (cell.color !== null && cell.color !== playerColor) return;

      cell.value += 1;
      cell.color = playerColor;

      const emitExploding = (id) => {
        io.to(roomId).emit("cellExploding", id);
      };

      await propagate(x, y, board, playerColor, emitExploding, io, roomId);

      // Verificar si alguien ganó
      const winner = checkWinner(board);
      if (winner) {
        game.winner = winner;
      } else {
        game.currentTurn = playerColor === "red" ? "blue" : "red";
      }

      io.to(roomId).emit("gameState", {
        board,
        currentTurn: game.currentTurn,
        winner: game.winner,
      });
    });

    // Reiniciar juego
    socket.on("resetGame", (roomId) => {
      const game = games[roomId];
      if (!game) return;

      const lastWinner = game.winner || "red";

      game.board = generateEmptyBoard();
      game.currentTurn = lastWinner;
      game.winner = null;

      io.to(roomId).emit("gameState", {
        board: game.board,
        currentTurn: game.currentTurn,
        winner: null,
      });
    });

    // Chat
    socket.on("sendMessage", ({ roomId, sender, message }) => {
      io.to(roomId).emit("message", { sender, message });
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
      for (const roomId in games) {
        const game = games[roomId];
        if (game?.players?.[socket.id]) {
          delete game.players[socket.id];
        }
      }
    });
  });
}

module.exports = { initSocket };
