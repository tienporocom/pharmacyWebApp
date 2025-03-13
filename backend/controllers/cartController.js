const Cart = require("../models/cart");

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
        const { user, sessionId, product, unitName, quantity, price } = req.body;

        let cart = await Cart.findOne({ $or: [{ user }, { sessionId }] });

        if (!cart) {
            cart = new Cart({ user, sessionId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === product);
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
exports.getCart = async (req, res) => {
    try {
        const { user, sessionId } = req.query;
        const cart = await Cart.findOne({ $or: [{ user }, { sessionId }] }).populate("items.product");
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

        const item = cart.items.find(item => item.product.toString() === product);
        if (!item) return res.status(404).json({ message: "Product not found in cart" });

        const unit = item.units.find(unit => unit.unitName === unitName);
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

        cart.items = cart.items.filter(item => item.product.toString() !== req.body.product);
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
