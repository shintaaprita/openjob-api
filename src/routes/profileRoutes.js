const express = require('express');
const router = express.Router();
const db = require('../database/pool'); // Menggunakan pool.js sesuai strukturmu
const authMiddleware = require('../middlewares/authMiddleware');

// Pasang authMiddleware agar semua endpoint di bawah ini otomatis terproteksi
router.use(authMiddleware);

// 1. GET /profile -> Melihat profile user yang sedang login
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.user.id; // Diambil dari token yang lolos verifikasi

    const query = {
      text: 'SELECT id, username, fullname, email, role FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await db.query(query);

    if (!result.rows.length) {
      return res.status(404).json({ status: 'fail', message: 'User tidak ditemukan' });
    }

    res.status(200).json({
      status: 'success',
      data: { user: result.rows[0] },
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /profile/applications -> Melihat daftar lamaran pekerjaan milik user yang login
router.get('/profile/applications', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = {
      text: `SELECT a.id, a.status, a.document_path, j.title as job_title, c.name as company_name 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE a.user_id = $1`,
      values: [userId],
    };

    const result = await db.query(query);

    res.status(200).json({
      status: 'success',
      data: { applications: result.rows[0] || [] },
    });
  } catch (error) {
    next(error);
  }
});

// 3. GET /profile/bookmarks -> Melihat daftar lowongan yang disimpan oleh user yang login
router.get('/profile/bookmarks', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = {
      text: `SELECT b.id, j.id as job_id, j.title as job_title, c.name as company_name 
             FROM bookmarks b
             JOIN jobs j ON b.job_id = j.id
             JOIN companies c ON j.company_id = c.id
             WHERE b.user_id = $1`,
      values: [userId],
    };

    const result = await db.query(resultQuery);

    res.status(200).json({
      status: 'success',
      data: { bookmarks: result.rows || [] },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;