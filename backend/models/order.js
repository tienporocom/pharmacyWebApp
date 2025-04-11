const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Không bắt buộc nếu khách không đăng nhập
    },
    orderItems: [
      // Danh sách sản phẩm trong đơn hàng
      // {
      //   product: {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: "Product",
      //     required: true,
      //   },
      //   items: [
      //     // Chi tiết số lượng theo từng đơn vị
      //     {
      //       unitName: { type: String, required: true }, // Tên đơn vị (hộp, vỉ, viên,...)
      //       quantity: { type: Number, required: true }, // Số lượng theo đơn vị
      //       price: { type: Number, required: true }, // Giá tại thời điểm đặt hàng
      //     },
      //   ],
      //   subtotal: { type: Number, required: true }, // Tổng tiền cho sản phẩm này
      // }
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

//sample data
// {
//   "user": "646f8c9e2f8b1c0d4b3e4e7a",
//   "orderItems": [
//     {
//       "product": "646f8c9e2f8b1c0d4b3e4e7b",
//       "items": [
//         {
//           "unitName": "hộp",
//           "quantity": 2,
//           "price": 50000
//         },
//         {
//           "unitName": "vỉ",
//           "quantity": 1,
//           "price": 20000
//         }
//       ],
//       "subtotal": 120000
//     },
//     {
//       "product": "646f8c9e2f8b1c0d4b3e4e7c",
//       "items": [
//         {
//           "unitName": "hộp",
//           "quantity": 1,
//           "price": 30000
//         }
//       ],
//       "subtotal": 30000
//     }
//   ],
//   "shippingAddress": {

//       "address": "123 Đường ABC, Quận 1, TP.HCM",
//       "phone": "0901234567"
//     },
//     "totalAmountBeforeDiscount": 150000,
//     "totalAmount": 150000,
//     "discount": {
//       "amount": 0,
//       "percentage": 0
//     },
//     "status": "pending",
//     "paymentMethod": "cash",
//     "paymentStatus": "unpaid"
// }
//
