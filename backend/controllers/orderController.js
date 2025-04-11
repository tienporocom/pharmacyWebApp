const Order = require("../models/order");

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, phoneNumber } = req.body;
    const userId = req.user._id || req.user.userId;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm trong đơn hàng." });
    }

    // Tính subtotal cho từng item
    const calculatedOrderItems = orderItems.map((item) => {
      const subtotal = item.items.reduce((sum, unit) => {
        const quantity = Number(unit.quantity) || 0;
        const price = Number(unit.price) || 0;
        return sum + quantity * price;
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
      totalAmountBeforeDiscount: totalAmount,
      totalAmount,
      status: "pending", // Trạng thái mặc định khi tạo đơn hàng
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
    const userId = req.user._id || req.user.userId;
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 }); // Mới nhất trước
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy chi tiết đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate("orderItems.product");;

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const validStatuses = ["new", "pending", "processing", "shipped", "delivered", "cancelled"];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công!", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa đơn hàng thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tất cả đơn hàng (admin)
exports.getAllOrders = async (req, res) => {
  try {
    // Nếu dùng phân quyền thì kiểm tra ở đây
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập." });
    }

    const orders = await Order.find()
      .populate("orderItems.product")
      .populate("user", "name phoneNumber")
      .sort({ createdAt: -1 }); // Mới nhất trước

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
