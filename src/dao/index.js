import ProductsDAO from './managers/products.dao.js';
import CartsDAO from './managers/carts.dao.js';
import UsersDAO from './managers/users.dao.js';

export const productsDAO = new ProductsDAO();
export const cartsDAO = new CartsDAO();
export const usersDAO = new UsersDAO();
