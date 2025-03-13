const { Router } = require("express");
const mongoose = require("mongoose");
// Nhóm thuốc
const drugGroupSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Tên nhóm thuốc
    description: { type: String },           // Mô tả
    image: { type: String },                 // Ảnh đại diện
    order: { type: Number, default: 0 }      // Thứ tự hiển thị
    });

module.exports = mongoose.model('DrugGroup', drugGroupSchema);
// module.exports = Router();
// module.exports = mongoose.model("DrugGroup", drugGroupSchema);
// module.exports = mongoose.model("DrugGroup", drugGroupSchema);