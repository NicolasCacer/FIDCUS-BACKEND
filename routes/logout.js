const express = require("express");
const router = express.Router();
const { clearToken } = require("../controllers/logout");

router.post("/", clearToken);

module.exports = router;
