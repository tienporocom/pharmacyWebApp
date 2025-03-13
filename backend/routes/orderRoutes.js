const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Middleware xác thực JWT
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder,
  getAllOrders // Thêm route cho admin
} = require('../controllers/orderController');

// Tạo đơn hàng mới (yêu cầu xác thực)
router.post('/', authMiddleware, createOrder);

// Lấy danh sách đơn hàng của người dùng (yêu cầu xác thực)
router.get('/', authMiddleware, getOrders);

// Lấy chi tiết đơn hàng theo ID (yêu cầu xác thực)
router.get('/:id', authMiddleware, getOrderById);

// Cập nhật trạng thái đơn hàng (yêu cầu xác thực)
router.put('/:id/status', authMiddleware, updateOrderStatus);

// Xóa đơn hàng (yêu cầu xác thực)
router.delete('/:id', authMiddleware, deleteOrder);

// Lấy tất cả đơn hàng (dành cho admin, yêu cầu xác thực và quyền admin)
router.get('/all', authMiddleware, getAllOrders);

module.exports = router;