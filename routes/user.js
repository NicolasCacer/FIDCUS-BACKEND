const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controllers/user");
const verifyToken = require("../middleware/verifyToken");

// GET /users
router.get("/", verifyToken, getAllUsers);

module.exports = router;
