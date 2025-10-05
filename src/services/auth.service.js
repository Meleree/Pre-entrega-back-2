import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../dao/models/user.model.js';
import { sendEmail } from './email.service.js';
import crypto from 'crypto';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';
const RESET_PASSWORD_EXPIRES = 60 * 60 * 1000;

const AuthService = {
  generateToken(user) {
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  },

  async registerUser({ first_name, last_name, email, password, age, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Usuario ya registrado');

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      age,
      role: role || 'user',
    });

    await newUser.save();
    return newUser;
  },

  async loginUser({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Usuario no encontrado');

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) throw new Error('Contraseña incorrecta');

    return user;
  },

  async sendResetPasswordEmail(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Usuario no encontrado');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + RESET_PASSWORD_EXPIRES;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `<p>Hacé click <a href="${resetLink}">aquí</a> para restablecer tu contraseña. El enlace expira en 1 hora.</p>`;

    await sendEmail(user.email, 'Restablecer contraseña', html);
  },

  async resetPassword(token, newPassword) {
    const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });
    if (!user) throw new Error('Token inválido o expirado');

    const isSamePassword = bcrypt.compareSync(newPassword, user.password);
    if (isSamePassword) throw new Error('No se puede usar la misma contraseña anterior');

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return true;
  },

  async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    const { _id, first_name, last_name, email, age, role } = user;
    return { id: _id, first_name, last_name, email, age, role };
  }
};

export default AuthService;
