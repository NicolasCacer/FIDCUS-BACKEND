const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  getUserByUsername,
} = require("../controllers/user");
const verifyToken = require("../middleware/verifyToken");

// GET /users
router.get("/", verifyToken, getAllUsers);
router.get("/:username", verifyToken, getUserByUsername);
router.put("/:username", verifyToken, updateUser);

module.exports = router;
