const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Không bắt buộc nếu khách không đăng nhập
    },
    orderItems: [
    
      {
        _id: mongoose.Schema.Types.ObjectId,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        items: [
          {
            unitName: { type: String, required: true }, // Tên đơn vị (hộp, vỉ, viên,...)
            quantity: { type: Number, required: true }, // Số lượng theo đơn vị
            price: { type: Number, required: true }, // Giá tại thời điểm đặt hàng
          }
        ], 
        subtotal: { type: Number, required: true } // Tổng tiền cho sản phẩm này
      }
    ],
    shippingAddress: {
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    totalAmountBeforeDiscount: { type: Number, required: true }, // Tổng tiền trước khi giảm giá toàn đơn hàng
    totalAmount: { type: Number, required: true }, // Tổng tiền đơn hàng
    discount: {
      // Giảm giá áp dụng cho toàn đơn hàng
      amount: { type: Number, default: 0 }, // Số tiền giảm (VD: 20000 VNĐ)
      percentage: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: [
        "new",
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "new",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
