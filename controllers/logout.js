const clearToken = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Session sucessfully closed" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { clearToken };
