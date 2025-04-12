const { Router } = require("express");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: "user" },
  avatar: {
    type: String,
    
  },
  dOB: { type: Date, default: Date.now },
  sex: { type: String },
  address: [
    {
      address: { type: String },
      phoneToDelivery: { type: String },
      default: { type: Boolean, default: false },
    },
  ]
});
module.exports = mongoose.model("User", userSchema);


