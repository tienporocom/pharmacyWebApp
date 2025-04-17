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

// Lấy danh sách đơn hàng của người dùng trừ đơn có trạng thái new
// Không trả trường description
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user; // Lấy ID người dùng từ token
    const orders = await Order.find({ user: userId , status: { $ne: "new" } })
      .populate("orderItems.product", "name images isPrescribe drugGroup iD packaging manufacturer manufacturerOrigin registrationNumber ingredient placeOfManufacture dosageForm packagingUnits sales") // Không lấy description
      .sort({ createdAt: -1 }); // Mới nhất trước
    res.json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error.message);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách đơn hàng" });
  }
};

//Lọc đơn hàng theo trạng thái
exports.getOrdersByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const userId = req.user; // Lấy ID người dùng từ token
    const orders = await Order.find({ user: userId, status })
      .populate("orderItems.product", "name images isPrescribe drugGroup iD packaging manufacturer manufacturerOrigin registrationNumber ingredient placeOfManufacture dosageForm packagingUnits sales") // Không lấy description
      .sort({ createdAt: -1 }); 
    res.json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error.message);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách đơn hàng" });
  }
}

//Tìm kiếm đơn hàng bằng tên sản phẩm, mã đơn hàng
exports.searchOrders = async (req, res) => {
  try {
    //lấy từ khoá
    const search = req.query.search || ""; // Tìm kiếm theo tên sản phẩm hoặc ID đơn hàng
    const userId = req.user; // Lấy ID người dùng từ token
    const orders = await Order.find({user: userId }).populate("orderItems.product", "name images isPrescribe drugGroup iD packaging manufacturer manufacturerOrigin registrationNumber ingredient placeOfManufacture dosageForm packagingUnits sales ") // Không lấy description
    // Tìm kiếm theo tên sản phẩm hoặc ID đơn hàng từ danh sách đơn hàng
    const response = orders.filter((order) => {
      const orderItems = order.orderItems.map(item => item.product.name.toLowerCase()).join(" ");
      return order._id.toString().includes(search) || orderItems.includes(search.toLowerCase());
    }
    );

   
    res.json(response);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm đơn hàng:", error.message);
    res.status(500).json({ error: "Lỗi server khi tìm kiếm đơn hàng" });
  }
};
// VD: gọi /api/orders/search?search=Paracetamol

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
    const status = req.body.status;

    // console.log("Status:", status);
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


//Liệt kke các trường có trong đơn hàng
// user, orderItems, shippingAddress, phoneNumber, totalAmountBeforeDiscount, totalAmount, discount , paymentStatus,
// status, paymentMethod, createdAt, updatedAt
//
//Cập nhật đơn hàng với tất cả các trường
exports.updateOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      phoneNumber,
      totalAmountBeforeDiscount,
      totalAmount,
      discount,
      paymentStatus,
      status,
      paymentMethod,
      createdAt,
      updatedAt,
    } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    

    order.orderItems = orderItems || order.orderItems;
    order.shippingAddress = shippingAddress || order.shippingAddress;
    order.phoneNumber = phoneNumber || order.phoneNumber;
    order.totalAmountBeforeDiscount = totalAmountBeforeDiscount || order.totalAmountBeforeDiscount;
    order.totalAmount = totalAmount || order.totalAmount;
    order.discount = discount || order.discount;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.status = status || order.status;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.createdAt = createdAt || order.createdAt;
    order.updatedAt = updatedAt || order.updatedAt;

    await order.save();
    res.json({ message: "Cập nhật đơn hàng thành công!", order });
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}

   

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
    
    const orders = await Order.find()
      .populate("orderItems.product", "name images isPrescribe drugGroup iD packaging manufacturer manufacturerOrigin registrationNumber ingredient placeOfManufacture dosageForm packagingUnits sales") // Không lấy description
      .populate("user", "name phoneNumber")
      .sort({ createdAt: -1 }); // Mới nhất trước

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


