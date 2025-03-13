// Middleware xử lý lỗi
const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack); // Ghi log lỗi
    res.status(500).json({ 
      msg: 'Có lỗi xảy ra!', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined // Chỉ hiển thị chi tiết lỗi trong môi trường dev
    });
  };
  
  module.exports = errorMiddleware;