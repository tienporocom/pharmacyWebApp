const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getGroups,
  getProductsByGroup,
  updateProductQuantity,
    getProductsByPage,
    searchProducts,
    getTotalProducts,
    getBestSellingProducts

} = require("../controllers/productController");

//lấy danh sách nhóm sản phẩm
router.get("/groups", getGroups);
//lấy danh sách sản phẩm theo nhóm
router.get("/groups/:group", getProductsByGroup);
//tìm kiếm sản phẩm theo tên, nhóm, thành phần, mô tả ngắn, id, nhà sản xuất

router.get("/", getProducts); // Lấy danh sách sản phẩm
router.get("/page", getProductsByPage); // Lấy danh sách sản phẩm theo phân trang
router.get("/groups", getGroups); // Lấy danh sách nhóm sản phẩm
router.get("/groups/:group", getProductsByGroup); // Lấy danh sách sản phẩm theo nhóm
router.get("/search", searchProducts); // Tìm kiếm sản phẩm
router.get("/total", getTotalProducts); // Lấy tổng số sản phẩm
router.get("/bestselling", getBestSellingProducts); // Lấy danh sách sản phẩm bán chạy
router.get("/:id", getProduct); // Lấy chi tiết sản phẩm
router.post("/", createProduct); // Thêm sản phẩm mới
router.put("/:id", updateProduct); // Cập nhật sản phẩm
router.patch("/:id", updateProductQuantity); // Cập nhật sản phẩm
router.delete("/:id", deleteProduct); // Xóa sản phẩm
module.exports = router;
