const express = require('express');
const cors = require('cors');
const { sequelize, User } = require('./models');
require('dotenv').config();

const app = express();

// 1. Konfigurasi CORS (Lebih aman untuk integrasi)
app.use(cors({
  origin: '*', // Nantinya ganti dengan domain frontend kamu, misal: 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ukt', require('./routes/ukt'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notif', require('./routes/notif'));

// 2. Handle 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// 3. Global Error Handler (Penting agar frontend dapet pesan error yang jelas)
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Gunakan { alter: true } jika ingin sync otomatis tanpa hapus data saat ada perubahan model
    await sequelize.sync({ alter: true }); 
    
    const adminEmail = 'admin@kampus.id';
    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      // Pastikan password dihash di model atau sebelum create jika menggunakan bcrypt
      await User.create({ nama: 'Admin', email: adminEmail, password: 'admin123', role: 'admin' });
      console.log('seeded admin@kampus.id / password: admin123');
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();