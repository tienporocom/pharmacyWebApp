const express = require("express");
const authMiddleware = require('../middleware/auth'); // Middleware xác thực JWT
const roleMiddleware = require("../middleware/role");
const router = express.Router();

const {
  sendMessage,
  getAllMessages,
  getMessagesByUser,
  replyToUser,
} = require("../controllers/chatController");

// Xử lý gửi tin nhắn từ người dùng
router.post("/send", authMiddleware, sendMessage);

// Xử lý lấy tin nhắn theo người dùng
router.get("/messages", authMiddleware, getMessagesByUser);

// Xử lý lấy tất cả tin nhắn
router.get("/allMessages", authMiddleware, getAllMessages);

// Xử lý gửi tin nhắn từ admin cho người dùng
router.post("/reply/:userId", authMiddleware, replyToUser);

module.exports = router;