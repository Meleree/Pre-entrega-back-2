// src/routes/users.router.js
import express from "express";
import UserDTO from "../dtos/user.dto.js"; // ajusta según tu carpeta
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Devuelve info segura del usuario logueado
router.get("/current", authMiddleware, (req, res) => {
  const userDTO = new UserDTO(req.user);
  res.json(userDTO);
});

export default router;
