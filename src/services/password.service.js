import crypto from "crypto";
import UserRepository from "../repositories/users.repository.js";
import { sendEmail } from "./email.service.js";
import { hashPassword } from "../utils/helpers.js";

const userRepo = new UserRepository();
const tokenStore = new Map(); // simple memory store

export const requestPasswordReset = async (email) => {
  const user = await userRepo.getByEmail(email);
  if (!user) throw new Error("Usuario no encontrado");

  const token = crypto.randomBytes(20).toString("hex");
  tokenStore.set(token, { userId: user._id, expires: Date.now() + 3600000 }); // 1 hora

  const resetLink = `${process.env.FRONTEND_URL}/password/reset/${token}`;
  await sendEmail({
    to: email,
    subject: "Restablecer contraseña",
    html: `<p>Haz click <a href="${resetLink}">aquí</a> para restablecer tu contraseña. Este enlace expira en 1 hora.</p>`
  });
};

export const passwordReset = async (token, newPassword) => {
  const record = tokenStore.get(token);
  if (!record || record.expires < Date.now()) throw new Error("Token inválido o expirado");

  const user = await userRepo.getById(record.userId);
  const hashedNew = hashPassword(newPassword);
  if (user.password === hashedNew) throw new Error("La nueva contraseña no puede ser igual a la anterior");

  user.password = hashedNew;
  await user.save();
  tokenStore.delete(token);
};
