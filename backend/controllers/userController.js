const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký người dùng mới
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name,
            email,
            password: hashedPassword,
            address,
            phone
        });

        await user.save();
        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Đăng nhập người dùng
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Lấy thông tin hồ sơ người dùng
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Cập nhật thông tin hồ sơ người dùng
exports.updateUserProfile = async (req, res) => {
    try {
        const { name, address, phone, avatar } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        user.name = name || user.name;
        user.address = address || user.address;
        user.phone = phone || user.phone;
        user.avatar = avatar || user.avatar;

        await user.save();
        res.json({ message: 'Cập nhật thành công', user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};

// Xóa tài khoản người dùng
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Xóa tài khoản thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ', error });
    }
};