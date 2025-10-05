// routes/password.router.js
import { Router } from "express";
import { passwordReset, requestPasswordReset } from "../services/password.service.js";

const router = Router();

// Formulario para solicitar reseteo de contraseña
router.get("/forgot", (req, res) => {
  res.render("forgot-password", { title: "Recuperar contraseña" });
});

// Enviar solicitud de reseteo
router.post("/request-reset", async (req, res, next) => {
  try {
    const { email } = req.body;
    await requestPasswordReset(email);
    res.json({ message: "Se envió un correo para restablecer la contraseña" });
  } catch (err) {
    next(err);
  }
});

// Mostrar formulario para nueva contraseña usando token
router.get("/reset/:token", (req, res) => {
  const { token } = req.params;
  res.render("reset-password", { title: "Restablecer contraseña", token });
});

// Procesar nueva contraseña
router.post("/reset/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    await passwordReset(token, newPassword);
    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    next(err);
  }
});

export default router;
