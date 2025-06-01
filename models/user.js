const db = require("../firebase/firebase");

class User {
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.email = data.email;
    // Agrega otros campos que uses
  }

  static collection() {
    return db.collection("users");
  }

  static async getAll() {
    const snapshot = await this.collection().get();
    const users = [];
    snapshot.forEach((doc) => {
      users.push(new User(doc.id, doc.data()));
    });
    return users;
  }
}

module.exports = User;
