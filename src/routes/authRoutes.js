const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database/pool');
const authService = require('../database/authService');
const validate = require('../middlewares/validate'); 
const { registerSchema, loginSchema } = require('../validators/schema'); 

// 1. REGISTER NEW USER (PUBLIC)
router.post('/users', validate(registerSchema), async (req, res, next) => {
  try {
    const { username, password, fullname } = req.body;
    
    // Sesuaikan dengan fungsi di authService kamu (pastikan parameternya pas)
    const newUser = await authService.registerUser({ username, password, fullname });
    
    res.status(201).json({
      status: 'success',
      message: 'User berhasil didaftarkan',
      data: { userId: newUser.id }
    });
  } catch (error) {
    next(error);
  }
});

// 2. GET USER BY ID (PUBLIC)
router.get('/users/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, username as name, email, role FROM users WHERE id = $1', [req.params.id]);
    if (!result.rows.length) {
      return res.status(404).json({ status: 'failed', message: 'User tidak ditemukan' });
    }
    res.status(200).json({ status: 'success', data: { user: result.rows[0] } });
  } catch (error) {
    next(error);
  }
});

// 3. LOGIN (PUBLIC)
router.post('/authentications', validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Verifikasi credential menggunakan username
    const user = await authService.verifyUserCredential(username, password);

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: '3h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.REFRESH_TOKEN_KEY
    );

    await authService.addRefreshToken(refreshToken);

    res.status(201).json({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: { accessToken, refreshToken }
    });
  } catch (error) {
    next(error);
  }
});

// 4. REFRESH ACCESS TOKEN (PUBLIC)
router.put('/authentications', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ status: 'failed', message: 'Refresh token harus dilampirkan' });
    }

    await authService.verifyRefreshToken(refreshToken);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(400).json({ status: 'failed', message: 'Refresh token tidak sah' });
      }

      const accessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: '3h' }
      );

      res.status(200).json({
        status: 'success',
        message: 'Access Token berhasil diperbarui',
        data: { accessToken }
      });
    });
  } catch (error) {
    next(error);
  }
});

// 5. LOGOUT (PROTECTED)
router.delete('/authentications', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ status: 'failed', message: 'Refresh token harus dilampirkan' });
    }
    await authService.deleteRefreshToken(refreshToken);
    res.status(200).json({
      status: 'success',
      message: 'Refresh token berhasil dihapus (Logout berhasil)'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;