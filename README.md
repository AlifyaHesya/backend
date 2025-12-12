// package.json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "sequelize db:migrate"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.10.0",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.32.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "sequelize-cli": "^6.6.0"
  }
}
// src
// server.js
const express = require('express');
const cors = require('cors');
const { sequelize, User } = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ukt', require('./routes/ukt'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notif', require('./routes/notif'));

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync(); // for dev; use migrations in prod
    // ensure admin exists (seed)
    const adminEmail = 'admin@kampus.id';
    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      await User.create({ nama: 'Admin', email: adminEmail, password: 'admin123', role: 'admin' });
      console.log('seeded admin@kampus.id / password: admin123');
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(err);
  }
})();
