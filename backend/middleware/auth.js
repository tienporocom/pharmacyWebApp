const jwt = require('jsonwebtoken');

// Middleware xác thực JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Lấy token từ header

  if (!token) {
    return res.status(401).json({ msg: 'Không có token, truy cập bị từ chối' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Xác minh token
    req.user = decoded.id; // Gán ID người dùng vào req
    next(); // Chuyển tiếp nếu hợp lệ
  } catch (err) {
    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;

