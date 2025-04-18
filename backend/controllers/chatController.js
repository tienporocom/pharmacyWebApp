const ChatModel = require("../models/chat");
const express = require("express");
const router = express.Router();

// Xử lý gửi tin nhắn từ người dùng
exports.sendMessage = async (req, res) => {
  const user = req.user;
  const message = req.body.message;

  try {
    console.log("Sending message:", message);
    console.log("User:", user);
    await ChatModel.create({ user, message, timestamp: new Date() });
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, error: "Lỗi khi gửi tin nhắn." });
  }
};

// Xử lý lấy tất cả tin nhắn
exports.getAllMessages = async (req, res) => {
  try {
    // Lấy tất cả tin nhắn từ cơ sở dữ liệu
    const chatMessages = await ChatModel.find().sort({ timestamp:  1 });
    res.status(200).send(chatMessages);
  } catch (error) {
    res
      .status(500)
      .send({ success: false, error: "Lỗi khi lấy dữ liệu chat." });
  }
};

// Xử lý lấy tin nhắn theo người dùng xuất từ cũ đến mới nhất
exports.getMessagesByUser = async (req, res) => {
  const user = req.user;
  
  try {
    const chatMessages = await ChatModel.find({ user: user }).sort({
      timestamp: 1,
    });
    res.status(200).send(chatMessages);
  } catch (error) {
    res
      .status(500)
      .send({ success: false, error: "Lỗi khi lấy dữ liệu chat." });
  }
};

// Xử lý gửi tin nhắn từ admin cho người dùng
exports.replyToUser = async (req, res) => {
  const user = req.body.user;
  const message = req.body.message;
  try {
    await ChatModel.create({
      user: user,
      message: `REP:${message}`,
      timestamp: new Date(),
    });
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false, error: "Lỗi khi gửi tin nhắn." });
  }
};
