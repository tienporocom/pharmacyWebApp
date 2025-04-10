// const Cart = require("../models/cart");
const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");

const status = {
  NEW: "new",
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { product, unitName, quantity } = req.body;
    const user = req.user;

    // Gọi API để lấy giá theo đơn vị
    const response = await fetch(
      `http://localhost:5000/api/products/${product}`
    );
    const productData = await response.json();

    const unit = productData.packagingUnits.find(
      (u) => u.unitName === unitName
    );
    if (!unit) {
      return res.status(400).json({ error: "Đơn vị không hợp lệ" });
    }

    const price = unit.price;

    // Tìm giỏ hàng hiện tại của user có trạng thái "new"
    let cart = await Order.findOne({ user: user, status: "new" });

    if (!cart) {
      cart = new Order({
        user: user,
        orderItems: [],
        shippingAddress: {
          address: "not set",
          phone: "not set",
        },
        totalAmountBeforeDiscount: 0,
        totalAmount: 0,
        discount: {
          amount: 0,
          percentage: 0,
        },
        status: "new",
        paymentMethod: "cash",
        paymentStatus: "unpaid",
      });
    }
    await cart.save();

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingProduct = cart.orderItems.find(
      (item) => item.product.toString() === product
    );

    const subtotalToAdd = price * quantity;

    if (existingProduct) {
      // Tìm trong mảng items xem đã có đơn vị đó chưa
      const existingUnit = existingProduct.items.find(
        (i) => i.unitName === unitName
      );

      if (existingUnit) {
        existingUnit.quantity += quantity;
        existingUnit.price = price; // cập nhật giá nếu cần
      } else {
        existingProduct.items.push({
          unitName,
          quantity,
          price,
        });
      }

      // Cập nhật lại subtotal
      existingProduct.subtotal += subtotalToAdd;
    } else {
      // Thêm sản phẩm mới vào giỏ hàng
      cart.orderItems.push({
        _id: new mongoose.Types.ObjectId(),
        product,
        items: [
          {
            unitName,
            quantity,
            price,
          },
        ],
        subtotal: subtotalToAdd,
      });
    }

    // Cập nhật tổng tiền đơn hàng
    cart.totalAmountBeforeDiscount = cart.orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    cart.totalAmount = cart.totalAmountBeforeDiscount - cart.discount.amount;

    await cart.save();

    res.json({ message: "Thêm sản phẩm vào giỏ hàng thành công!", cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Lấy giỏ hàng
// exports.getCart = async (req, res) => {
//   try {
//     let userId = req.user;
//     // console.log(userId);
//     const user = await User.findById(req.user);
//     // console.log(user);
//     const cart = await Cart.findOne({ user }).populate("items.product");
//     res.json(cart || { items: [] });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getCart = async (req, res) => {
//   try {
//     const  user  = req.user;
//     console.log(user);
//     const cart = await cart.findOne({ user }).populate("items.product");
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     const cartDetails = cart.items.map((item) => ({
//       productId: item.product._id,
//       productName: item.product.name,
//       units: item.units.map((unit) => ({
//         unitName: unit.unitName,
//         quantity: unit.quantity,
//         price: unit.price,
//       })),
//     }));

//     res.json(cartDetails);
//   } catch (error) {
//     console.log("errrrrrrrr")
//     res.status(500).json({ error: error.message });
//   }
// };

//Lấy thông tin giỏ hàng
exports.getCartInfo = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user, status: status.NEW })
      .populate("orderItems.product") // Populate the product field inside orderItems
      .exec();

    if (orders === undefined || orders.length == 0) {
      throw new Error("Order item not found");
    }

    const order = orders[0];
    res.json(order);
  } catch (error) {
    console.log(`get cart info error ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates the quantity and subtotal of an orderItem inside an Order document.
 *
 * @param {String} itemId - The _id of the orderItem to update.
 * @param {Number} newQuantity - The new quantity to set.
 * @returns {Object} The updated order item.
 */
async function updateOrderItemQuantity(itemId, newQuantity) {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw new Error("Invalid order item ID");
  }

  // Tìm giỏ hàng có trạng thái "new" chứa item cần cập nhật
  const order = await Order.findOne({ status: "new", "orderItems.items._id": itemId });

  if (!order) {
    throw new Error("Order not found");
  }

  // Duyệt qua từng orderItem và các unit bên trong để tìm đúng itemId
  let updatedUnit = null;

  for (const orderItem of order.orderItems) {
    for (const unit of orderItem.items) {
      if (unit._id.toString() === itemId) {
        // Cập nhật số lượng và tính lại subtotal
        const oldSubtotal = unit.price * unit.quantity;
        unit.quantity = newQuantity;

        const newSubtotal = unit.price * newQuantity;
        orderItem.subtotal += newSubtotal - oldSubtotal;

        updatedUnit = unit;
        break;
      }
    }
  }

  if (!updatedUnit) {
    throw new Error("Item not found in any order item");
  }


  await order.save();
   
  return updatedUnit;
}


// Cập nhật sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const updatedItem = await updateOrderItemQuantity(itemId, quantity);

    if (updatedItem){
      //Cap nhat lại tổng tiền đơn hàng
      const order = await Order.findOne({ status: "new", user: req.user });
      order.totalAmountBeforeDiscount = order.orderItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      order.totalAmount = order.totalAmountBeforeDiscount - order.discount.amount;
      await order.save();
    }
    res.status(200).json({
      message: "Quantity updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.log(`error when udpate quantity ${error}`);
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
// VD:http://localhost:5000/api/cart/item/67f798f0743b087f405ce73b?
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Order.findOne({ user: req.user, status: "new" });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemId = req.params.itemId;
    cart.orderItems.forEach((item, index) => {
      item.items.forEach((unit, unitIndex) => {
        if (unit._id.toString() === itemId) {
          // Cập nhật subtotal trước khi xóa
          cart.orderItems[index].subtotal -= unit.price * unit.quantity;
          cart.orderItems[index].items.splice(unitIndex, 1); // Xóa đơn vị

          // Nếu không còn đơn vị nào trong orderItem, xóa orderItem
          if (cart.orderItems[index].items.length === 0) {
            cart.orderItems.splice(index, 1); // Xóa orderItem
          }
        }
      });
    });

    // Cập nhật tổng tiền đơn hàng
    cart.totalAmountBeforeDiscount = cart.orderItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    cart.totalAmount = cart.totalAmountBeforeDiscount - cart.discount.amount;
    await cart.save();

    res.json({ message: "Item removed from cart!", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    await Order.findOneAndDelete({ user: req.user.userId });
    res.json({ message: "Cart cleared!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
