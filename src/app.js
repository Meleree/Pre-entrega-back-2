import express from 'express';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import './config/passport.js';
import passwordRouter from './routes/password.router.js';

import sessionsRouter from './routes/sessions.router.js';
import usersViewsRouter from './routes/views.router.js';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import connectDB from './config/db.js';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static(path.resolve(__dirname, '../public')));

// Handlebars 
app.engine(
  'handlebars',
  handlebars.engine({
    helpers: {
      json: (context) => JSON.stringify(context),
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, 'views'));

// Routers
app.use('/users', sessionsRouter);          
app.use('/api/products', productsRouter);   
app.use('/api/carts', cartsRouter);         
app.use('/', usersViewsRouter);             
app.use('/password', passwordRouter); 

// HTTP + Socket.io
const server = http.createServer(app);
const io = new SocketServer(server);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('productAdded', (product) => io.emit('productAdded', product));
  socket.on('deleteProduct', (productId) => io.emit('productDeleted', productId));
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

// Conectar MongoDB y levantar server
const PORT = process.env.PORT || 8080;
connectDB().then(() => {
  server.listen(PORT, () =>
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
  );
});
