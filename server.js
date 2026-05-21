const express = require('express');
require('dotenv').config();
const errorHandler = require('./src/middlewares/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const coreRoutes = require('./src/routes/coreRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes'); // <--- Tambah baris ini

const app = express();

app.use(express.json());

// Jalur tes dasar
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di OpenJob RESTful API Versi 1!' });
});

// Hubungkan seluruh rute ke aplikasi
app.use(authRoutes);
app.use(profileRoutes);
app.use(coreRoutes);
app.use(applicationRoutes); // <--- Tambah baris ini

// Penanganan Error Terpusat
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});