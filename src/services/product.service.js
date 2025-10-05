// src/services/product.service.js
import Product from "../dao/models/product.model.js";

class ProductService {
  constructor() {}

  async getAll({ limit = 10, page = 1, query = "", sort = "" }) {
    const limitParsed = Math.max(parseInt(limit), 1);
    const pageParsed = Math.max(parseInt(page), 1);
    const sortOrder = sort === "asc" ? 1 : sort === "desc" ? -1 : null;

    const filters = {};
    if (query) filters.$or = [{ category: query }, { status: query === "available" }];

    return await Product.paginate(filters, {
      limit: limitParsed,
      page: pageParsed,
      sort: sortOrder ? { price: sortOrder } : undefined
    });
  }

  async getById(id) {
    const product = await Product.findById(id);
    if (!product) throw new Error("Producto no encontrado");
    return product;
  }

  async create(data) {
    const newProduct = new Product(data);
    await newProduct.save();
    return newProduct;
  }

  async update(id, data) {
    const updated = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("Producto no encontrado");
    return updated;
  }

  async delete(id) {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) throw new Error("Producto no encontrado");
    return deleted;
  }
}

export default new ProductService();
