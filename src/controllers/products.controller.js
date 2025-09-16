import CartMDB from "../models/cart.model.js";
import ProductMDB from "../models/product.model.js";

const getAllProducts = async (req, res) => {
    try {
      const products = await ProductMDB.find();
      res.status(200).json({ status: "success", payload: products });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Error al obtener los productos" });
    }
  };

const getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await ProductMDB.findById(id);
  
      if (!product) {
        return res.status(404).json({ status: "error", message: "Producto no encontrado" });
      }
  
      const mainThumbnail = product.thumbnail || product.thumbnails[0]; // Fallback si no hay thumbnail principal
      res.status(200).json({ status: "success", payload: { ...product.toObject(), mainThumbnail } });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Error al obtener el producto" });
    }
  };

const getCartById = async (req, res) => {
    try {
        const cid = req.params.cid;

        const cart = await CartMDB.findById(cid).populate('products.product');
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al recuperar el carrito" });
    }
};

const deleteProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await CartMDB.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        cart.products = cart.products.filter(product => product.product.toString() !== pid);
        await cart.save();

        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto del carrito" });
    }
};

const addProductToCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const { pid, quantity } = req.body;

        const cart = await CartMDB.findById(cid);
        const product = await ProductMDB.findById(pid);

        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        cart.products.push({ product: pid, quantity });
        await cart.save();

        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al agregar el producto al carrito" });
    }
};

const updateProductQuantityInCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const cart = await CartMDB.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        const productInCart = cart.products.find(product => product.product.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
        }

        productInCart.quantity = quantity;
        await cart.save();

        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar la cantidad del producto en el carrito" });
    }
};

const deleteAllProductsFromCart = async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await CartMDB.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        cart.products = [];
        await cart.save();

        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar los productos del carrito" });
    }
};

export { getAllProducts, getCartById, addProductToCart, updateProductQuantityInCart, deleteProductFromCart, deleteAllProductsFromCart };
