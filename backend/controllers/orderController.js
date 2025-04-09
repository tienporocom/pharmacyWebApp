const Order = require("../models/order");

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, phoneNumber } =
      req.body;
    const userId = req.user._id || req.user.userId; // dùng cái nào có

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm trong đơn hàng." });
    }

    // Tính subtotal cho từng item
    const calculatedOrderItems = orderItems.map((item) => {
      const subtotal = item.items.reduce((sum, unit) => {
        return sum + unit.quantity * unit.price;
      }, 0);

      return {
        product: item.product,
        items: item.items,
        subtotal: subtotal,
      };
    });

    // Tính tổng số tiền toàn đơn hàng
    const totalAmount = calculatedOrderItems.reduce((sum, item) => {
      return sum + item.subtotal;
    }, 0);

    const newOrder = new Order({
      user: userId,
      orderItems: calculatedOrderItems,
      shippingAddress,
      paymentMethod,
      phoneNumber,
      totalAmount,
    });

    await newOrder.save();

    res.status(201).json({ message: "Đặt hàng thành công!", order: newOrder });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error.message);
    res.status(500).json({ error: "Lỗi server khi tạo đơn hàng" });
  }
};

// Lấy danh sách đơn hàng của người dùng
exports.getOrders = async (req, res) => {
  try {
    console.log(req.user);
    const orders = await Order.find({ user: req.user }).populate(
      "orderItems.product"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy chi tiết đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "orderItems.product"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    await order.save();
    res.json({ message: "Order status updated!", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tất cả đơn hàng (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("orderItems.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
