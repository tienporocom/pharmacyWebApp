const xlsx = require("xlsx");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./backend/models/product"); // Import model sản phẩm
const connectDB = require("./backend/config/db");

dotenv.config();
connectDB(); // Kết nối MongoDB

// 🟢 Hàm chuẩn hóa giá tiền (loại bỏ "đ", dấu "." phân cách hàng nghìn)
const normalizePrice = (priceStr) => {
  return parseFloat(priceStr.replace(/[^\d]/g, "")) || 0;
};

// 🟢 Hàm đọc Excel và nhóm dữ liệu theo sản phẩm
const readExcelData = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(sheet);

  const groupedData = {};

  rawData.forEach((row) => {
    let productName = row["tenThuoc"] ? row["tenThuoc"].trim() : "";
    let unitName = row["layDVT"] ? row["layDVT"].trim() : "";
    let price = row["layGia"] ? normalizePrice(row["layGia"].trim()) : 0;

    if (!groupedData[productName]) {
      groupedData[productName] = {
        name: productName,
        description: row["moTa"] || "",
        shortDescription: row["layMoTaNgan"] || "",
        images: row["hinhThuoc-src"] || "",
        isPrescribe: row["keToa"] === "Có",
        drugGroup: row["nhomThuoc"] || "",
        iD: row["LayID"] || "",
        packaging: row["layQuyCach"] || "",
        manufacturer: row["layNSX"] || "",
        manufacturerOrigin: row["XSThuongHieu"] || "",
        registrationNumber: row["laySoDangKy"] || "",
        ingredient: row["layThanhPHan"] || "",
        placeOfManufacture: row["layNuocSanXUat"] || "",
        dosageForm: row["layDangBaoChe"] || "",
        packagingUnits: [],
      };
    }
    if (unitName === "") unitName = "Viên";
    if (price === 0) price = 10000;
    // ✅ Thêm đơn vị tính và giá vào sản phẩm
    groupedData[productName].packagingUnits.push({ unitName, price, quantity: 100 });
  });

  return Object.values(groupedData);
};

// 🟢 Hàm lưu dữ liệu vào MongoDB
const saveToDatabase = async (data) => {
  try {
    for (let item of data) {
      const newProduct = new Product({
        name: item.name,
        description: item.description,
        shortDescription: item.shortDescription,
        images: item.images,
        isPrescribe: item.isPrescribe,
        drugGroup: item.drugGroup,
        iD: item.iD,
        packaging: item.packaging,
        manufacturer: item.manufacturer,
        manufacturerOrigin: item.manufacturerOrigin,
        registrationNumber: item.registrationNumber,
        ingredient: item.ingredient,
        placeOfManufacture: item.placeOfManufacture,
        dosageForm: item.dosageForm,
        packagingUnits: item.packagingUnits,
      });

      await newProduct.save();
      console.log(`✅ Lưu sản phẩm: ${newProduct.name} thành công!`);
    }
    console.log("🎉 Import dữ liệu hoàn tất!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Lỗi khi lưu vào DB:", error);
  }
};

// 🟢 Chạy chương trình
const filePath = "C://Users//tienp//Downloads//DBThuoc.xlsx"; // Đường dẫn file Excel đã tải lên
const excelData = readExcelData(filePath);

console.log("📋 Dữ liệu đã trích xuất:", JSON.stringify(excelData, null, 2));

saveToDatabase(excelData);
