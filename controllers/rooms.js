// controllers/rooms.js
const db = require("../firebase/firebase");

const fetchRooms = async () => {
  try {
    const snapshot = await db.collection("rooms").get();
    if (snapshot.empty) return [];

    const rooms = [];
    snapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() });
    });

    return rooms;
  } catch (error) {
    console.error("Error fetching rooms from Firebase:", error);
    return [];
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await fetchRooms();
    res.json({ rooms });
  } catch (error) {
    console.error("Error in room fetching:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const newRoomRef = await db.collection("rooms").add({
      name,
      createdAt: new Date().toLocaleString(),
    });

    const newRoomDoc = await newRoomRef.get();

    const newRoom = {
      id: newRoomDoc.id,
      ...newRoomDoc.data(),
    };

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getRooms, fetchRooms, createRoom };
