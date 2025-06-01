const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Ahora el token viene desde la cookie llamada "token"
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // puedes usar req.user.email luego
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
