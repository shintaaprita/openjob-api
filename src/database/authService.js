const db = require('./pool');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Fungsi untuk registrasi user baru
const registerUser = async ({ username, password, fullname, email, role = 'user' }) => {
  // Hash password agar aman di database
  const hashedPassword = await bcrypt.hash(password, 10);
  // Buat ID unik otomatis dengan prefix 'user-'
  const id = `user-${crypto.randomBytes(8).toString('hex')}`;

  const query = {
    text: 'INSERT INTO users(id, username, password, fullname, email, role) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, username',
    values: [id, username, hashedPassword, fullname, email, role],
  };

  try {
    const result = await db.query(query);
    return result.rows[0];
  } catch (error) {
    // Jika email atau username duplikat (Unique Constraint Error)
    if (error.code === '23505') {
      const err = new Error('Username atau email sudah terdaftar.');
      err.statusCode = 400;
      throw err;
    }
    throw error;
  }
};

// Fungsi untuk memverifikasi kredensial saat login
const verifyUserCredential = async (username, password) => {
  const query = {
    text: 'SELECT * FROM users WHERE username = $1',
    values: [username],
  };

  const result = await db.query(query);

  if (!result.rows.length) {
    const err = new Error('Kredensial yang Anda berikan salah.');
    err.statusCode = 400;
    throw err;
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    const err = new Error('Kredensial yang Anda berikan salah.');
    err.statusCode = 400;
    throw err;
  }

  return { id: user.id, role: user.role };
};

// Fungsi untuk menyimpan Refresh Token ke database tabel authentications
const addRefreshToken = async (token) => {
  const query = {
    text: 'INSERT INTO authentications VALUES($1)',
    values: [token],
  };
  await db.query(query);
};

// Fungsi untuk memverifikasi apakah Refresh Token terdaftar di database
const verifyRefreshToken = async (token) => {
  const query = {
    text: 'SELECT token FROM authentications WHERE token = $1',
    values: [token],
  };
  const result = await db.query(query);
  if (!result.rows.length) {
    const err = new Error('Refresh token tidak sah.');
    err.statusCode = 400;
    throw err;
  }
};

// Fungsi untuk menghapus Refresh Token (Logout)
const deleteRefreshToken = async (token) => {
  const query = {
    text: 'DELETE FROM authentications WHERE token = $1',
    values: [token],
  };
  await db.query(query);
};

module.exports = {
  registerUser,
  verifyUserCredential,
  addRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
};