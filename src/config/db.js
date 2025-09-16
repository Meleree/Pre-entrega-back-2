import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    console.log("📌 Conectando a MongoDB con URI:", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'Melere',
    });

    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}
