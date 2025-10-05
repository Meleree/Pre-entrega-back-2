// src/routes/carts.router.js
import { Router } from "express";
import cartService from "../services/cart.service.js";
import TicketService from "../services/ticket.service.js";
import { verifyToken } from "../utils/jwt.js";

const router = Router();
const ticketService = new TicketService();

// 🛒 Crear carrito
router.post("/", async (req, res) => {
  try {
    const cart = await cartService.createCart();
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    console.error("❌ Error al crear carrito:", err);
    res.status(500).json({ status: "error", message: "Error al crear el carrito" });
  }
});

// 🛒 Obtener carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartService.getCartById(req.params.cid);
    res.json(cart);
  } catch (err) {
    console.error("❌ Error al obtener carrito:", err);
    res.status(404).json({ message: err.message });
  }
});

// ➕ Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity) || 1;
    const cart = await cartService.addProduct(req.params.cid, req.params.pid, quantity);
    res.json(cart);
  } catch (err) {
    console.error("❌ Error al agregar producto al carrito:", err);
    res.status(400).json({ message: err.message });
  }
});

// 🔁 Actualizar cantidad (+/-)
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const quantityChange = parseInt(req.body.quantity);
    if (isNaN(quantityChange)) throw new Error("Cantidad inválida");

    const cart = await cartService.updateProductQuantity(req.params.cid, req.params.pid, quantityChange);
    res.json(cart);
  } catch (err) {
    console.error("❌ Error al actualizar cantidad:", err);
    res.status(400).json({ message: err.message });
  }
});

// ❌ Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await cartService.removeProduct(req.params.cid, req.params.pid);
    res.json(cart);
  } catch (err) {
    console.error("❌ Error al eliminar producto:", err);
    res.status(400).json({ message: err.message });
  }
});

// 🧹 Vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.params.cid);
    res.json(cart);
  } catch (err) {
    console.error("❌ Error al vaciar carrito:", err);
    res.status(400).json({ message: err.message });
  }
});

// 💳 CHECKOUT (Finalizar compra)
router.post("/:cid/checkout", async (req, res) => {
  try {
    // Leer usuario desde cookie JWT
    const token = req.signedCookies?.currentUser;
    if (!token) {
      console.warn("⚠️ Intento de checkout sin token");
      return res.status(401).json({ message: "Debes iniciar sesión para finalizar la compra." });
    }

    const user = verifyToken(token);
    if (!user?.email) {
      console.warn("⚠️ Token inválido o sin email");
      return res.status(401).json({ message: "Token inválido o usuario no autorizado." });
    }

    console.log(`🧾 Iniciando checkout para el usuario: ${user.email}`);

    // Generar ticket
    const ticket = await ticketService.checkoutCart(req.params.cid, user.email);

    console.log(`✅ Compra realizada correctamente. Ticket: ${ticket.code}`);

    res.status(200).json({
      status: "success",
      message: "Compra realizada con éxito",
      payload: ticket,
    });
  } catch (err) {
    console.error("💥 Error al realizar el checkout:", err);
    res.status(400).json({ message: err.message || "Hubo un problema al realizar la compra" });
  }
});

export default router;
