const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../firebase/firebase");

const login = async (req, res) => {
  const { displayName, password } = req.body;

  try {
    const snapshot = await db
      .collection("users")
      .where("username", "==", displayName.toLowerCase())
      .get();

    if (snapshot.empty)
      return res.status(401).json({ error: "User not found" });

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch)
      return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ email: userData.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 4 * 60 * 60 * 1000, // 4 hours of lifespan
    });

    res.json({ message: "Login succesfull" });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { login };
