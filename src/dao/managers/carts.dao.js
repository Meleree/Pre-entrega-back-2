import CartModel from '../models/cart.model.js';

export default class CartsDAO {
  async getAll() {
    return await CartModel.find().populate('products.product');
  }

  async getById(id) {
    return await CartModel.findById(id).populate('products.product');
  }

  async create(cartData) {
    return await CartModel.create(cartData);
  }

  async update(cartId, updatedData) {
    return await CartModel.findByIdAndUpdate(cartId, updatedData, { new: true });
  }

  async delete(cartId) {
    return await CartModel.findByIdAndDelete(cartId);
  }

  async addProductToCart(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    const existingProduct = cart.products.find(p => p.product.toString() === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return cart;
  }

  async clearCart(cartId) {
    const cart = await CartModel.findById(cartId);
    cart.products = [];
    await cart.save();
    return cart;
  }
}
