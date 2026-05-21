const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Mengambil token dari header 'Authorization'
  const authHeader = req.headers['authorization'];
  
  // Header biasanya berbentuk: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Akses ditolak. Token tidak disediakan.',
    });
  }

  try {
    // Verifikasi token menggunakan secret key dari .env
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    
    // Simpan data user yang login (id dan role) ke dalam object 'req' agar bisa dipakai di route selanjutnya
    req.user = decoded;
    
    next(); // Lanjut ke proses berikutnya
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak sah atau sudah kedaluwarsa.',
    });
  }
};

module.exports = authMiddleware;