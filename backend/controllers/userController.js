import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Get all users (admin only)
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'staff',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // منع المدير من حذف نفسه
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الحالي' });
    }

    await user.deleteOne();
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user statistics (admin only)
// @route   GET /api/users/stats
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const staffUsers = await User.countDocuments({ role: 'staff' });
    const customerUsers = await User.countDocuments({ role: 'customer' });

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: last30Days } });

    res.json({
      totalUsers,
      adminUsers,
      staffUsers,
      customerUsers,
      newUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import DeliveryDriver from '../models/DeliveryDriver.js';

// @desc    Create a driver (admin only)
// @route   POST /api/users/drivers
export const createDriver = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'driver',
    });

    const driver = await DeliveryDriver.create({ user: user._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      driver: driver,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all drivers (admin only)
// @route   GET /api/users/drivers
export const getDrivers = async (req, res) => {
  try {
    const drivers = await DeliveryDriver.find().populate('user', 'name email phone');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};