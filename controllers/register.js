const bcrypt = require("bcrypt");
const db = require("../firebase/firebase");

const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password requiered" });

  try {
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();
    if (!snapshot.empty)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").add({
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User succesfully registered" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register };
