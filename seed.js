import mongoose from 'mongoose';
import User from './src/dao/models/user.model.js'; // default import
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado para seed'))
  .catch(err => console.log(err));

async function seed() {
  try {
    // Limpiar la colección de usuarios
    await User.deleteMany({}); 

    // Crear usuarios de ejemplo
    const admin = new User({
      first_name: 'Admin',
      last_name: 'Super',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    });

    const user = new User({
      first_name: 'Usuario',
      last_name: 'Normal',
      email: 'user@test.com',
      password: 'user123',
      role: 'user'
    });

    // Guardar en la base de datos
    await admin.save();
    await user.save();

    console.log('Usuarios seed creados exitosamente');
    process.exit();
  } catch (err) {
    console.error('Error al crear seeds:', err);
    process.exit(1);
  }
}

seed();
