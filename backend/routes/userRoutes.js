const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth"); // Middleware xác thực JWT
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAddress,
  updateAddress
} = require("../controllers/userController");

// Đăng ký người dùng mới
router.post("/register", registerUser);

// Đăng nhập người dùng
router.post("/login", loginUser);

// Lấy thông tin hồ sơ người dùng (yêu cầu xác thực)
router.get("/profile", authMiddleware, getUserProfile);

// Cập nhật thông tin hồ sơ người dùng (yêu cầu xác thực)
router.put("/profile", authMiddleware, updateUserProfile);

// Xóa tài khoản người dùng (yêu cầu xác thực)
router.delete("/profile", authMiddleware, deleteUser);


router.get("/address", authMiddleware, getAddress);
router.put("/address", authMiddleware, updateAddress);
module.exports = router;
