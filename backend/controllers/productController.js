const Product = require("../models/product");

// lấy danh sách nhóm sản phẩm
exports.getGroups = async (req, res) => {
  try {
    const groups = await Product.distinct("drugGroup");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//lấy danh sách sản phẩm theo nhóm
exports.getProductsByGroup = async (req, res) => {
  try {
    const products = await Product.find({ drugGroup: req.params.group });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách sản phẩm
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// lấy danh sách sản phẩm theo phân trang và nhóm sản phẩm
exports.getProductsByPage = async (req, res) => {
  try {
    const { page, limit, group } = req.query;
    const products = await Product.find({ drugGroup: group })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách sản phẩm theo nhóm
exports.getProductsByGroup = async (req, res) => {
  try {
    const products = await Product.find({ drugGroup: req.params.group });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tim kiếm sản phẩm theo tên, nhóm, thành phần, mô tả ngắn, id, nhà sản xuất
exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { drugGroup: { $regex: keyword, $options: "i" } },
        { ingredient: { $regex: keyword, $options: "i" } },
        { shortDescription: { $regex: keyword, $options: "i" } },
        { iD: { $regex: keyword, $options: "i" } },
        { manufacturer: { $regex: keyword, $options: "i" } },
      ],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy chi tiết sản phẩm
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully!", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật số lượng sản phẩm
exports.updateProductQuantity = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.quantity = req.body.quantity;
    await product.save();
    res.json({
      message: "Product quantity updated successfully!",
      product: product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
