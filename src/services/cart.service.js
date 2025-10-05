// src/services/cart.service.js
import Cart from "../dao/models/cart.model.js";
import Product from "../dao/models/product.model.js";

class CartService {
  async createCart() {
    const cart = new Cart();
    await cart.save();
    return cart;
  }

  async getCartById(cid) {
    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart) throw new Error("Carrito no encontrado");
    return cart;
  }

  // Agregar producto al carrito (si existe, suma cantidad)
  async addProduct(cid, pid, quantity = 1) {
    const cart = await this.getCartById(cid);
    const product = await Product.findById(pid);
    if (!product) throw new Error("Producto no encontrado");

    const existing = cart.products.find(p => p.product._id.equals(pid));
    if (existing) existing.quantity += quantity;
    else cart.products.push({ product: pid, quantity });

    await cart.save();
    return cart;
  }

  // Actualizar cantidad (+/-) de un producto
  async updateProductQuantity(cid, pid, quantityChange) {
    const cart = await this.getCartById(cid);
    const prod = cart.products.find(p => p.product._id.equals(pid));
    if (!prod) throw new Error("Producto no encontrado en el carrito");

    prod.quantity += quantityChange; // suma/resta
    if (prod.quantity <= 0) {
      // eliminar si llega a 0
      cart.products = cart.products.filter(p => !p.product._id.equals(pid));
    }

    await cart.save();
    return cart;
  }

  async removeProduct(cid, pid) {
    const cart = await this.getCartById(cid);
    cart.products = cart.products.filter(p => !p.product._id.equals(pid));
    await cart.save();
    return cart;
  }

  async clearCart(cid) {
    const cart = await this.getCartById(cid);
    cart.products = [];
    await cart.save();
    return cart;
  }
}

export default new CartService();
