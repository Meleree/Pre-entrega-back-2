// src/routes/current.router.js
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import AuthService from '../services/auth.service.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userDTO = await AuthService.getCurrentUser(req.user.id);
    res.json({ status: 'success', payload: userDTO });
  } catch (err) {
    res.status(404).json({ status: 'error', message: err.message });
  }
});

export default router;
