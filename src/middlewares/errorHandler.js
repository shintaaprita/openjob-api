const errorHandler = (err, req, res, next) => {
  // Jika error berasal dari Joi (validasi input)
  if (err.isJoi) {
    return res.status(400).json({
      status: 'failed', // <--- Diubah dari 'fail' menjadi 'failed'
      message: err.details[0].message.replace(/"/g, ''),
    });
  }

  // Jika error custom yang kita buat (kredensial salah, data tidak ketemu)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'failed', // <--- Diubah dari 'fail' menjadi 'failed'
      message: err.message,
    });
  }

  console.error(err.stack);
  
  // Jika error internal server
  return res.status(500).json({
    status: 'error',
    message: 'Terjadi kegagalan pada server kami.',
  });
};

module.exports = errorHandler;