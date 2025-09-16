import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.redirect('/users/login?error=1');
    }

    const token = generateToken(user);
    res.cookie('currentUser', token, { signed: true, httpOnly: true });
    res.redirect('/current');
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).send('Error interno');
  }
}

export async function registerUser(req, res) {
  try {
    const { first_name, last_name, email, password, age, cart } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.redirect('/users/register?error=1');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.redirect('/users/register?error=1');

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age: age || null,
      password: hashedPassword,
      cart: cart || null,
      role: 'user',
    });

    const token = generateToken(newUser);
    res.cookie('currentUser', token, { signed: true, httpOnly: true });
    res.redirect('/current');
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).send('Error interno');
  }
}

export async function currentUser(req, res) {
  try {
    res.json({ status: 'success', payload: req.user });
  } catch (err) {
    console.error('Error en currentUser:', err);
    res.status(500).json({ status: 'error', message: 'Error interno' });
  }
}

export async function logoutUser(req, res) {
  try {
    res.clearCookie('currentUser');
    res.redirect('/users/login');
  } catch (err) {
    console.error('Error en logout:', err);
    res.status(500).send('Error interno');
  }
}
