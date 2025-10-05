import ProductModel from '../models/product.model.js';

export default class ProductsDAO {
  async getAll(query = {}, options = {}) {
    return await ProductModel.paginate(query, options);
  }

  async getById(id) {
    return await ProductModel.findById(id);
  }

  async create(productData) {
    return await ProductModel.create(productData);
  }

  async update(id, productData) {
    return await ProductModel.findByIdAndUpdate(id, productData, { new: true });
  }

  async delete(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}
