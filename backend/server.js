const loggerMiddleware = require("./middleware/logger");
const errorMiddleware = require("./middleware/error");

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
dotenv.config();
connectDB();

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const drugGroupRoutes = require("./routes/drugGroupRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use(loggerMiddleware);
// Đăng ký các routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/drug-groups", drugGroupRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(errorMiddleware);
// console.log("MONGO_URI from .env:", process.env.MONGO_URI);
