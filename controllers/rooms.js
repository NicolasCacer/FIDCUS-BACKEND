const db = require("../firebase/firebase");

const getRooms = async (req, res) => {
  try {
    const snapshot = await db.collection("rooms").get();

    if (snapshot.empty) return res.json({ rooms: [] });
    const rooms = [];
    snapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() });
    });

    res.json({ rooms: rooms });
  } catch (error) {
    console.error("Error in room fetching:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getRooms };
