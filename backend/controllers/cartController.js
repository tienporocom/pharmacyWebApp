// const Cart = require("../models/cart");
const User = require("../models/user");
const Order = require("../models/order");
const mongoose = require("mongoose");

const status = {
  NEW: "new"
}

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { user, product, unitName, quantity, price } = req.body;
    console.log(req.body);
    let cart = await Order.findOne({ user });

    if (!cart) {
      cart = new Cart({ user, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].units.push({ unitName, quantity, price });
    } else {
      cart.items.push({ product, units: [{ unitName, quantity, price }] });
    }

    await cart.save();
    res.json({ message: "Item added to cart!", cart });
  } catch (error) {
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

exports.getCart = async (req, res) => {
  try {
    const  user  = req.user;
    console.log(user);
    const cart = await Cart.findOne({ user }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const cartDetails = cart.items.map((item) => ({
      productId: item.product._id,
      productName: item.product.name,
      units: item.units.map((unit) => ({
        unitName: unit.unitName,
        quantity: unit.quantity,
        price: unit.price,
      })),
    }));

    res.json(cartDetails);
  } catch (error) {
    console.log("errrrrrrrr")
    res.status(500).json({ error: error.message });
  }
};

//Lấy thông tin giỏ hàng
exports.getCartInfo = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user, status: status.NEW })
      .populate("orderItems.product") // Populate the product field inside orderItems
      .exec();

    if (orders === undefined || orders.length == 0) {
      throw new Error("Order item not found");
    }
  
    const order = orders[0]
    console.log(`response cart info ${order}`)
    res.json(order);
  } catch (error) {
    console.log(`get cart info error ${error.message}`)
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

  // Step 1: Find the order that contains the orderItem
  const order = await Order.findOne({ "orderItems._id": itemId });

  if (!order) {
    throw new Error("Order not found");
  }

  // Step 2: Get the specific item
  const item = order.orderItems.id(itemId);
  if (!item) {
    throw new Error("Order item not found");
  }

  // Step 3: Update fields
  item.quantity = newQuantity;
  item.subtotal = item.price * newQuantity;

  // Step 4: Save and return the updated item
  await order.save();
  return item;
}

// Cập nhật sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const updatedItem = await updateOrderItemQuantity(itemId, quantity);
    res.status(200).json({
      message: "Quantity updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.log(`error when udpate quantity ${error}`)
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Order.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.body.product
    );
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
