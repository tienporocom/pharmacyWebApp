const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký người dùng mới
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, dOB, sex } = req.body;

    let user = await User.findOne({ email });
    let userPhone = await User.findOne({ phone });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    } else if (userPhone) {
      return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      dOB,
      phone,
      sex,
    });

    await user.save();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

// Đăng nhập người dùng
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // console.log(user.password);
    // console.log(password);
    console.log(await bcrypt.compare(password, user.password));
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
    }
    console.log(user);
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(token);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

// Lấy thông tin hồ sơ người dùng
exports.getUserProfile = async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user);

    // if (!user) {
    //   return res.status(404).json({ message: "Người dùng không tồn tại" });
    // }
    // console.log(user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

// Cập nhật thông tin hồ sơ người dùng
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, address, phone, avatar, dOB, sex } = req.body;
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    user.name = name || user.name;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;
    user.dOB = dOB || user.dOB;
    user.sex = sex || user.dOB;

    await user.save();
    res.json({ message: "Cập nhật thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

// Xóa tài khoản người dùng
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user);
    res.json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

// lấy danh sách địa chỉ
exports.getAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.json(user.address);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

// chỉnh sửa danh sách địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    console.log(req.user);
    console.log(req.body);
    const user = await User.findById(req.user); 
  
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    user.address = req.body; // Gán danh sách địa chỉ mới vào user
    await user.save();

    res.json({ message: "Cập nhật địa chỉ thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};

// Lấy tất cả người dùng (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ", error });
  }
};


