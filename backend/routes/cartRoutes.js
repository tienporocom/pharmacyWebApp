const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Middleware xác thực JWT
const { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');

// Thêm sản phẩm vào giỏ hàng (hỗ trợ cả user và sessionId)
router.post('/', addToCart);

// Lấy thông tin giỏ hàng (hỗ trợ cả user và sessionId)
router.get('/', getCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng (yêu cầu xác thực hoặc sessionId)
router.put('/', authMiddleware, updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng (yêu cầu xác thực hoặc sessionId)
router.delete('/item', authMiddleware, removeFromCart);

// Làm trống giỏ hàng (yêu cầu xác thực hoặc sessionId)
router.delete('/clear', authMiddleware, clearCart);

module.exports = router;