import UsersDAO from '../dao/managers/users.dao.js';

export default class UsersRepository {
  constructor() {
    this.dao = new UsersDAO();
  }

  async getUsers() {
    return await this.dao.getAll();
  }

  async getUserById(id) {
    return await this.dao.getById(id);
  }

  async getUserByEmail(email) {
    return await this.dao.getByEmail(email);
  }

  async createUser(data) {
    return await this.dao.create(data);
  }

  async updateUser(id, data) {
    return await this.dao.update(id, data);
  }

  async deleteUser(id) {
    return await this.dao.delete(id);
  }
}
