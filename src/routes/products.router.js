import { Router } from "express";
import multer from "multer";
import Product from "../models/product.model.js";
import fs from "fs";
import path from "path";

const productsRouter = Router();

const uploadDir = path.join("public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

productsRouter.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, query = "", sort = "" } = req.query;
    const limitParsed = Math.max(parseInt(limit), 1);
    const pageParsed = Math.max(parseInt(page), 1);
    const sortOrder = sort === "asc" ? 1 : sort === "desc" ? -1 : null;

    const filters = {};
    if (query) filters.$or = [{ category: query }, { status: query === "available" }];

    const products = await Product.paginate(filters, {
      limit: limitParsed,
      page: pageParsed,
      sort: sortOrder ? { price: sortOrder } : undefined
    });

    res.status(200).json({
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}` : null,
      nextLink: products.hasNextPage ? `/products?page=${products.nextPage}` : null
    });
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ status: "error", message: "Error al obtener los productos." });
  }
});

productsRouter.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    console.error("Error al obtener el producto:", error.message);
    res.status(500).json({ message: "Error al obtener el producto." });
  }
});

productsRouter.post("/", upload.single("thumbnail"), async (req, res) => {
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  try {
    const { title, description, code, price, stock, category } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar presentes." });
    }

    const newProduct = new Product({
      title,
      description,
      code,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newProduct.save();
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    res.status(500).json({ message: "Error al agregar el producto." });
  }
});

productsRouter.put("/:pid", async (req, res) => {
  try {
    const { title, price, stock, thumbnail, category, description } = req.body;
    if (!title && !price && !stock && !thumbnail && !category && !description) {
      return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.pid,
      { title, price, stock, thumbnail, category, description },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    console.error("Error al actualizar el producto:", error.message);
    res.status(500).json({ message: "Error al actualizar el producto." });
  }
});

productsRouter.delete("/:pid", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
    if (!deletedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar el producto:", error.message);
    res.status(500).json({ message: "Error al eliminar el producto." });
  }
});

export default productsRouter;
