const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Middleware xác thực JWT
const { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart ,
  getCartInfo
} = require('../controllers/cartController');

// Thêm sản phẩm vào giỏ hàng (hỗ trợ cả user và sessionId)
router.post('/', addToCart);

// Lấy thông tin giỏ hàng (hỗ trợ cả user và sessionId)
router.get('/', getCart);

// Lấy thông tin giỏ hàng (hỗ trợ cả user và sessionId)
router.get('/info', getCartInfo);

// Cập nhật số lượng sản phẩm trong giỏ hàng 
router.put('/', authMiddleware, updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng 
router.delete('/item', authMiddleware, removeFromCart);

// Làm trống giỏ hàng 
router.delete('/clear', authMiddleware, clearCart);

module.exports = router;