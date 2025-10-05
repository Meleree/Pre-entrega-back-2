import { Router } from 'express';
import passport from 'passport';
import { verifyToken } from '../utils/jwt.js';
import Product from '../dao/models/product.model.js';
import Cart from '../dao/models/cart.model.js';

const router = Router();

const getUserFromCookie = (req) => {
  try {
    if (req.signedCookies.currentUser) {
      return verifyToken(req.signedCookies.currentUser);
    }
  } catch {
    return null;
  }
  return null;
};

router.get('/login', (req, res) => {
  const error = req.query.error || null;
  res.render('login', { error, title: 'Login' });
});

router.get('/register', (req, res) => {
  const error = req.query.error || null;
  res.render('register', { error, title: 'Registro' });
});

router.get(
  '/current',
  passport.authenticate('jwt', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user.toObject ? req.user.toObject() : req.user;
    res.render('current', { user, title: 'Perfil' });
  }
);

router.get('/logout', (req, res) => {
  res.clearCookie('currentUser');
  res.redirect('/login');
});

router.get('/', async (req, res) => {
  const user = getUserFromCookie(req);
  const products = await Product.find().lean();
  res.render('home', { title: 'Inicio', user, products });
});

router.get('/dashboard', async (req, res) => {
  const user = getUserFromCookie(req);
  const products = await Product.find().lean();
  res.render('dashboard', { title: 'Dashboard', user, products });
});

router.get('/carts', async (req, res) => {
  const user = getUserFromCookie(req);
  const carts = await Cart.find().populate('products.product').lean();
  res.render('carts', { title: 'Lista de Carritos', user, carts });
});

router.get('/carts/:cid', async (req, res) => {
  const user = getUserFromCookie(req);
  const cart = await Cart.findById(req.params.cid).populate('products.product').lean();

  if (!cart) {
    return res.status(404).render('error', {
      message: 'Carrito no encontrado',
      title: 'Error',
      user,
    });
  }

  res.render('cart', { cart, title: `Carrito ${cart._id}`, user });
});

// ✅ Nueva ruta para listar productos
router.get('/products', async (req, res) => {
  const user = getUserFromCookie(req);
  const products = await Product.find().lean();
  res.render('products', { title: 'Productos', user, products });
});

router.get('/products/:pid', async (req, res) => {
  const user = getUserFromCookie(req);
  console.log('Ruta /products/:pid llamada con id:', req.params.pid);

  try {
    const product = await Product.findById(req.params.pid).lean();
    console.log('Producto encontrado:', product);

    if (!product) {
      return res.status(404).render('error', { message: 'Producto no encontrado', title: 'Error', user });
    }

    product.thumbnail = product.thumbnail || (product.thumbnails && product.thumbnails[0]) || '/img/default-placeholder.png';

    res.render('productdetail', { product, title: product.title, user });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Error al cargar el producto', title: 'Error', user });
  }
});

router.get('/realtimeproducts', async (req, res) => {
  const user = getUserFromCookie(req);
  const products = await Product.find().lean();
  res.render('realtimeproducts', { title: 'Productos en tiempo real', user, products });
});

export default router;
