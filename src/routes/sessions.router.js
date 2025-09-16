import { Router } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Product from "../models/product.model.js";
import { generateToken } from "../utils/jwt.js";

const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  const error = req.query.error ? "Credenciales inválidas" : null;
  res.render("login", { error });
});

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).render("register", { error: "El usuario ya existe" });

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
    });

    const sanitizedUser = {
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role: newUser.role,
    };

    const token = generateToken(sanitizedUser);
    res.cookie("jwt", token, { httpOnly: true });

    res.redirect("/users/current");
  } catch (error) {
    console.error(error);
    res.status(500).render("register", { error: "Error en el registro" });
  }
});

router.post(
  "/login",
  passport.authenticate("login", { session: false, failureRedirect: "/users/login?error=1" }),
  async (req, res) => {
    const sanitizedUser = {
      _id: req.user._id,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
    };

    const token = generateToken(sanitizedUser);
    res.cookie("jwt", token, { httpOnly: true });

    res.redirect("/users/current");
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/users/login");
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const products = await Product.find().lean();

      res.render("current", {
        title: "Mi perfil",
        user,
        products,
        welcomeMessage: `¡Bienvenido/a ${user.first_name}!`,
      });
    } catch (err) {
      console.error(err);
      res.redirect("/users/login");
    }
  }
);

export default router;
