// src/routes/products.router.js
import { Router } from "express";
import multer from "multer";
import { authMiddleware, authorizeRole } from "../middlewares/auth.middleware.js";
import productService from "../services/product.service.js";

const router = Router();
const upload = multer({ dest: "public/uploads/" });

// Listar productos con paginación, filtro y orden
router.get("/", async (req, res) => {
  try {
    const products = await productService.getAll(req.query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtener producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const product = await productService.getById(req.params.pid);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Crear producto (solo admin)
router.post("/", authMiddleware, authorizeRole("admin"), upload.single("thumbnail"), async (req, res) => {
  try {
    const data = { ...req.body, thumbnail: req.file ? `/uploads/${req.file.filename}` : null };
    const product = await productService.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar producto (solo admin)
router.put("/:pid", authMiddleware, authorizeRole("admin"), async (req, res) => {
  try {
    const product = await productService.update(req.params.pid, req.body);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Eliminar producto (solo admin)
router.delete("/:pid", authMiddleware, authorizeRole("admin"), async (req, res) => {
  try {
    await productService.delete(req.params.pid);
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

export default router;
