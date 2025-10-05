import CartRepository from "../repositories/carts.repository.js";
import ProductRepository from "../repositories/products.repository.js";

const cartRepo = new CartRepository();
const productRepo = new ProductRepository();

export default class CartsController {
  static async getCarts(req, res, next) {
    try {
      const carts = await cartRepo.getAll();
      res.json(carts);
    } catch (err) {
      next(err);
    }
  }

  static async getCartById(req, res, next) {
    try {
      const cart = await cartRepo.getById(req.params.cid);
      if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });
      res.json(cart);
    } catch (err) {
      next(err);
    }
  }

  static async addProductToCart(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const product = await productRepo.getById(pid);
      if (!product) return res.status(404).json({ message: "Producto no encontrado" });

      const updatedCart = await cartRepo.addProduct(cid, product);
      res.json(updatedCart);
    } catch (err) {
      next(err);
    }
  }
}
