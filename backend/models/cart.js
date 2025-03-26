const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Không bắt buộc nếu khách vãng lai
    },
    // sessionId: {
    //   type: String,
    //   required: function () {
    //     return !this.user;
    //   }, // Bắt buộc nếu không có user (dành cho khách vãng lai)
    // },
    items: [
      // Danh sách sản phẩm trong giỏ hàng
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        units: [
          // Chi tiết số lượng theo từng đơn vị
          {
            unitName: { type: String, required: true }, // Tên đơn vị (hộp, vỉ, viên,...)
            quantity: { type: Number, required: true }, // Số lượng theo đơn vị
            price: { type: Number, required: true }, // Giá tại thời điểm thêm vào giỏ
          },
        ],
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Đảm bảo chỉ có một giỏ hàng cho mỗi user hoặc sessionId
cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Cart", cartSchema);
