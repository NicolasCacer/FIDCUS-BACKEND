const express = require("express");
const router = express.Router();
const { getRooms } = require("../controllers/rooms");

router.get("/", getRooms);

module.exports = router;
