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

const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.getUserByUsername(username);
    res.json(user);
  } catch (error) {
    console.error("Error", error);
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { username } = req.params;
  const updatedData = req.body;

  try {
    await User.updateUserByUsername(username, updatedData);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserByUsername,
  updateUser,
};
