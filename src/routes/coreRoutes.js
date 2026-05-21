const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../database/pool');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { companySchema, categorySchema, jobSchema } = require('../validators/schema');

// ==========================================
// 1. ENDPOINTS FOR COMPANIES
// ==========================================

// GET /companies -> List all companies (PUBLIC)
router.get('/companies', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM companies');
    res.status(200).json({ status: 'success', data: { companies: result.rows } });
  } catch (error) {
    next(error);
  }
});

// GET /companies/:id -> Get company detail (PUBLIC)
router.get('/companies/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ status: 'failed', message: 'Perusahaan tidak ditemukan' });
    res.status(200).json({ status: 'success', data: { company: result.rows[0] } });
  } catch (error) {
    next(error);
  }
});

// POST /companies -> Create company (PROTECTED)
router.post('/companies', authMiddleware, validate(companySchema), async (req, res, next) => {
  try {
    const { name, description, location } = req.body;
    const id = `company-${crypto.randomBytes(8).toString('hex')}`;
    await db.query('INSERT INTO companies(id, name, description, location) VALUES($1, $2, $3, $4)', [id, name, description, location]);
    res.status(201).json({ status: 'success', message: 'Perusahaan berhasil ditambahkan', data: { companyId: id } });
  } catch (error) {
    next(error);
  }
});


// ==========================================
// 2. ENDPOINTS FOR CATEGORIES
// ==========================================

// GET /categories -> List all categories (PUBLIC)
router.get('/categories', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories');
    res.status(200).json({ status: 'success', data: { categories: result.rows } });
  } catch (error) {
    next(error);
  }
});

// POST /categories -> Create category (PROTECTED)
router.post('/categories', authMiddleware, validate(categorySchema), async (req, res, next) => {
  try {
    const { name } = req.body;
    const id = `category-${crypto.randomBytes(8).toString('hex')}`;
    await db.query('INSERT INTO categories(id, name) VALUES($1, $2)', [id, name]);
    res.status(201).json({ status: 'success', message: 'Kategori berhasil ditambahkan', data: { categoryId: id } });
  } catch (error) {
    next(error);
  }
});


// ==========================================
// 3. ENDPOINTS FOR JOBS (WITH QUERY PARAMETERS)
// ==========================================

// GET /jobs -> List all jobs + Fitur Pencarian (PUBLIC)
router.get('/jobs', async (req, res, next) => {
  try {
    const { title, 'company-name': companyName } = req.query;
    
    let baseQuery = `
      SELECT j.id, j.title, j.description, c.name as company_name, cat.name as category_name 
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      JOIN categories cat ON j.category_id = cat.id
      WHERE 1=1
    `;
    const values = [];
    let paramIndex = 1;

    if (title) {
      baseQuery += ` AND j.title ILIKE $${paramIndex}`;
      values.push(`%${title}%`);
      paramIndex++;
    }

    if (companyName) {
      baseQuery += ` AND c.name ILIKE $${paramIndex}`;
      values.push(`%${companyName}%`);
      paramIndex++;
    }

    const result = await db.query(baseQuery, values);
    
    // Walaupun data hasil pencarian kosong (result.rows.length === 0),
    // status harus TETAP 'success' sesuai ekspektasi Postman Test
    return res.status(200).json({ 
      status: 'success', 
      data: { jobs: result.rows } 
    });
  } catch (error) {
    next(error);
  }
});

// GET /jobs/:id -> Get job detail (PUBLIC)
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM jobs WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ status: 'failed', message: 'Pekerjaan tidak ditemukan' });
    res.status(200).json({ status: 'success', data: { job: result.rows[0] } });
  } catch (error) {
    next(error);
  }
});

// POST /jobs -> Create job (PROTECTED)
router.post('/jobs', authMiddleware, validate(jobSchema), async (req, res, next) => {
  try {
    const { title, description, company_id, category_id } = req.body;
    const id = `job-${crypto.randomBytes(8).toString('hex')}`;
    
    await db.query(
      'INSERT INTO jobs(id, title, description, company_id, category_id) VALUES($1, $2, $3, $4, $5)',
      [id, title, description, company_id, category_id]
    );
    
    res.status(201).json({ status: 'success', message: 'Pekerjaan berhasil dibuat', data: { jobId: id } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;