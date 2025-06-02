const db = require("../firebase/firebase");

class User {
  constructor(id, data) {
    this.id = id;
    this.username = data.username;
    this.displayName = data.displayName;
    this.birthDate = data.birthDate;
    this.email = data.email;
    this.createdAt = new Date(data.createdAt).toLocaleString();
    this.updatedAt = new Date(data.updatedAt).toLocaleString();
  }

  static collection() {
    return db.collection("users");
  }

  static async getAll() {
    const snapshot = await this.collection().get();
    const users = [];
    snapshot.forEach((doc) => {
      const { password, ...rest } = doc.data();
      users.push(new User(doc.id, rest));
    });

    return users;
  }

  static async getUserByUsername(username) {
    const snapshot = await this.collection()
      .where("username", "==", username.toLowerCase())
      .get();

    if (snapshot.empty) {
      throw new Error("User not found");
    }

    const doc = snapshot.docs[0];
    const { password, ...rest } = doc.data();
    return { userData: rest };
  }

  static async updateUserByUsername(username, updatedData) {
    try {
      const user = await this.getUserByUsername(username);
      const userRef = this.collection().doc(user.id);
      await userRef.update(updatedData);
      return { success: true, message: "User updated successfully" };
    } catch (error) {
      console.error("Error updating user:", error);
    }
  }
}

module.exports = User;
