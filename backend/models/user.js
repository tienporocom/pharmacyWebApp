const { Router } = require("express");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  role: { type: String, default: "user" },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/dkkgmzj9p/image/upload/v1629310349/avatar/avatar-1577909_1280_vqzv9a.png",
  },
  dOB: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", userSchema);
