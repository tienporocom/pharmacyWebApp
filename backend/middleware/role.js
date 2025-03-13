const User = require('../models/user');

// Middleware kiểm tra vai trò
const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user); // Lấy thông tin user từ req.user (từ authMiddleware)
      if (!user) return res.status(404).json({ msg: 'Người dùng không tồn tại' });

      if (!allowedRoles.includes(user.role)) { // Kiểm tra role
        return res.status(403).json({ msg: 'Không có quyền truy cập' });
      }

      next(); // Chuyển tiếp nếu có quyền
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  };
};

module.exports = roleMiddleware;