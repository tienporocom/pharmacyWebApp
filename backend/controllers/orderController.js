const Order = require("../models/order");

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
    try {
        const newOrder = new Order({ user: req.user.userId, ...req.body });
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy danh sách đơn hàng của người dùng
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId }).populate("orderItems.product");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy chi tiết đơn hàng theo ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("orderItems.product");
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
