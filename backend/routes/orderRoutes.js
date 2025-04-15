const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Middleware xác thực JWT
const roleMiddleware = require("../middleware/role");

const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder,
  getOrdersByStatus,
  searchOrders,
  getAllOrders // Thêm route cho admin
} = require('../controllers/orderController');

// Tạo đơn hàng mới (yêu cầu xác thực)
router.post('/', authMiddleware, createOrder);

// Lấy danh sách đơn hàng của người dùng (yêu cầu xác thực)
router.get('/', authMiddleware, getOrders);

// Lấy tất cả đơn hàng (dành cho admin, yêu cầu xác thực và quyền admin)
router.get('/all', authMiddleware,roleMiddleware(["admin"]), getAllOrders);

// Lấy danh sách đơn hàng theo trạng thái (yêu cầu xác thực)
router.get('/status/:status', authMiddleware, getOrdersByStatus);

// Tìm kiếm đơn hàng theo tên sản phẩm, id (yêu cầu xác thực)
router.get('/search', authMiddleware, searchOrders);

// Lấy chi tiết đơn hàng theo ID (yêu cầu xác thực)
router.get('/:id', authMiddleware, getOrderById);

// Cập nhật trạng thái đơn hàng (yêu cầu xác thực)
router.put('/:id/status', authMiddleware, updateOrderStatus);

// Xóa đơn hàng (yêu cầu xác thực)
router.delete('/:id', authMiddleware, deleteOrder);


module.exports = router;