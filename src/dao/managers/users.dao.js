// src/dao/managers/users.dao.js
import User from '../models/user.model.js'; // <-- cambio aquí

export default class UsersDAO {
  async getAll() {
    return await User.find().lean();
  }

  async getById(id) {
    return await User.findById(id).lean();
  }

  async create(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async update(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }
}
