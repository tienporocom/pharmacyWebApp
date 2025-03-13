const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
    
  } catch (error) {
    console.error("MongoDB Connection Failed!", error);
    process.exit(1); // Dừng chương trình nếu kết nối thất bại
  }
};

module.exports = connectDB;
