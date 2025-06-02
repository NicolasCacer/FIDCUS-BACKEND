const bcrypt = require("bcrypt");
const db = require("../firebase/firebase");

const register = async (req, res) => {
  const { username, email, password, birthDate } = req.body;

  if (!email || !password || !username)
    return res
      .status(400)
      .json({ error: "Username, email and password required" });

  try {
    const snapshot = await db
      .collection("users")
      .where("username", "==", username.toLowerCase())
      .get();
    if (!snapshot.empty)
      return res.status(400).json({ error: "Username already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").add({
      username: username.toLowerCase(),
      displayName: username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      birthDate,
    });

    res.status(201).json({ message: "User succesfully registered" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register };
