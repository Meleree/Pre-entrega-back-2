import CartsDAO from '../dao/managers/carts.dao.js';

export default class CartsRepository {
  constructor() {
    this.dao = new CartsDAO();
  }

  async getCarts() {
    return await this.dao.getAll();
  }

  async getCartById(id) {
    return await this.dao.getById(id);
  }

  async createCart(data) {
    return await this.dao.create(data);
  }

  async addProduct(cartId, productId, quantity = 1) {
    return await this.dao.addProductToCart(cartId, productId, quantity);
  }

  async clearCart(cartId) {
    return await this.dao.clearCart(cartId);
  }

  async deleteCart(cartId) {
    return await this.dao.delete(cartId);
  }
}
