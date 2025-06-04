const express = require("express");
const router = express.Router();
const { getRooms, createRoom } = require("../controllers/rooms");

router.get("/", getRooms);
router.post("/", createRoom);

module.exports = router;
