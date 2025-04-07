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
// API lấy danh sách sản phẩm theo phân trang (nếu không nhập group thì lấy tất cả)
exports.getProductsByPage = async (req, res) => {
  try {
    const { page = 1, limit = 10, group } = req.query; // Mặc định page=1, limit=10 nếu không nhập
    const query = group ? { drugGroup: group } : {}; // Nếu có group thì lọc, không thì lấy tất cả

    const products = await Product.find(query)
      .limit(Number(limit)) // Chuyển limit thành số
      .skip((Number(page) - 1) * Number(limit)) // Skip theo phân trang
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

//Lấy tổng số lượng sản phẩm
exports.getTotalProducts = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    res.json({ total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Lấy danh sách sản phẩm bán chạy theo nhóm sản phẩm và phân trang (có thể lấy theo tất cả nhóm sản phẩm)
exports.getBestSellingProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, group } = req.query; // Mặc định page=1, limit=10 nếu không nhập
    const query = group ? { drugGroup: group } : {}; // Nếu có group thì lọc, không thì lấy tất cả

    const products = await Product.find(query)
      .sort({ sales: -1 }) // Sắp xếp theo số lượng bán
      .limit(Number(limit)) // Chuyển limit thành số
      .skip((Number(page) - 1) * Number(limit)) // Skip theo phân trang
      .exec();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};