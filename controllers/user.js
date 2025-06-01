const User = require("../models/user");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error when fetching data" });
  }
};

module.exports = {
  getAllUsers,
};
