const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const db = require('../database/pool');
const authMiddleware = require('../middlewares/authMiddleware');

// Konfigurasi penyimpanan file Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // File lamaran akan disimpan di folder uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Pasang authMiddleware karena semua rute lamaran di bawah ini sifatnya PROTECTED
router.use(authMiddleware);

// 1. POST /applications -> Melamar pekerjaan dengan mengunggah dokumen (multipart/form-data)
router.post('/applications', upload.single('document'), async (req, res, next) => {
  try {
    const { job_id } = req.body;
    const userId = req.user.id;
    
    if (!job_id) {
      return res.status(400).json({ status: 'fail', message: 'job_id harus diisi' });
    }

    // Path file yang diunggah (jika ada)
    const documentPath = req.file ? req.file.path : null;
    const id = `app-${crypto.randomBytes(8).toString('hex')}`;

    await db.query(
      'INSERT INTO applications(id, user_id, job_id, status, document_path) VALUES($1, $2, $3, $4, $5)',
      [id, userId, job_id, 'pending', documentPath]
    );

    res.status(201).json({
      status: 'success',
      message: 'Lamaran kerja berhasil dikirim',
      data: { applicationId: id }
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET /applications -> List all applications
router.get('/applications', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM applications');
    res.status(200).json({ status: 'success', data: { applications: result.rows } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;