class ProductRepository {
  constructor(dao) {
      this.dao = dao;
  }

  async getAll(filters = {}, options = {}) {
      return await this.dao.getAll(filters, options);
  }

  async getById(id) {
      return await this.dao.getById(id);
  }

  async create(productData) {
      return await this.dao.create(productData);
  }

  async update(id, updateData) {
      return await this.dao.update(id, updateData);
  }

  async delete(id) {
      return await this.dao.delete(id);
  }
}

export default ProductRepository;
