const { Router } = require("express");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên thuốc, bắt buộc
  description: { type: String }, // Mô tả thuốc
  shortDescription: { type: String }, // Mô tả ngắn
  images: { type: String }, // URL ảnh sản phẩm
  isPrescribe: { type: Boolean, default: false }, // Thuốc kê đơn, mặc định false
  drugGroup: { type: String }, // Nhóm thuốc
  iD: { type: String, required: true }, // Mã định danh, bắt buộc
  packaging: { type: String }, // Thông tin đóng gói
  manufacturer: { type: String }, // Nhà sản xuất
  manufacturerOrigin: { type: String }, // Nguồn gốc nhà sản xuất
  registrationNumber: { type: String }, // Số đăng ký
  ingredient: { type: String }, // Thành phần
  placeOfManufacture: { type: String }, // Nơi sản xuất
  dosageForm: { type: String }, // Dạng bào chế
  packagingUnits: [
    // Danh sách đơn vị đóng gói
    {
      unitName: { type: String, default: "Viên" }, // Tên đơn vị (hộp, vỉ,...)
      quantity: { type: Number, default: 100 }, // Số lượng đơn vị con trong cha
      price: { type: Number, default: 10000 }, // Giá theo đơn vị
    },
  ],
  sales:{type:Number,default:0}, // Số lượng đã bán
});

module.exports = mongoose.model("Product", productSchema);


