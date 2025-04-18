const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  user: String , // Người gửi 
  message: String, // Nội dung tin nhắn
  timestamp: { type: Date, default: Date.now }, // Thời gian gửi
});

module.exports = mongoose.model("Chat", ChatSchema);