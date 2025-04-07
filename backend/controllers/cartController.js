const Cart = require("../models/cart");
const User = require("../models/user");

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { user, product, unitName, quantity, price } = req.body;
    console.log(req.body);
    let cart = await Cart.findOne({ user });

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
    res.status(500).json({ error: error.message });
  }
};

//Lấy thông tin giỏ hàng
exports.getCartInfo = async (req, res) => {
  try {
    const { user } = req.query;
    const cart = await Cart.findOne({ user });
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật sản phẩm trong giỏ hàng
exports.updateCartItem = async (req, res) => {
  try {
    const { product, unitName, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((item) => item.product.toString() === product);
    if (!item)
      return res.status(404).json({ message: "Product not found in cart" });

    const unit = item.units.find((unit) => unit.unitName === unitName);
    if (!unit) return res.status(404).json({ message: "Unit not found" });

    unit.quantity = quantity;
    await cart.save();
    res.json({ message: "Cart item updated!", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
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
    await Cart.findOneAndDelete({ user: req.user.userId });
    res.json({ message: "Cart cleared!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
