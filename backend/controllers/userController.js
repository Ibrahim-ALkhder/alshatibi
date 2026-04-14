import User from '../models/User.js';
import Address from '../models/Address.js';
import DeliveryDriver from '../models/DeliveryDriver.js';

// @desc    Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [Address],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [Address],
    });
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user (admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already used' });

    const user = await User.create({ name, email, password, phone, role: role || 'staff' });
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user (admin)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    if (req.body.password) user.password = req.body.password;
    await user.save();

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user (admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'لا يمكنك حذف حسابك الحالي' });
    }
    await user.destroy();
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user stats
export const getUserStats = async (req, res) => {
  try {
    const total = await User.count();
    const admin = await User.count({ where: { role: 'admin' } });
    const staff = await User.count({ where: { role: 'staff' } });
    const driver = await User.count({ where: { role: 'driver' } });
    const customer = await User.count({ where: { role: 'customer' } });
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.count({ where: { createdAt: { [Op.gte]: last30 } } });

    res.json({ totalUsers: total, adminUsers: admin, staffUsers: staff, driverUsers: driver, customerUsers: customer, newUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create driver
export const createDriver = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email exists' });
    const user = await User.create({ name, email, password, phone, role: 'driver' });
    const driver = await DeliveryDriver.create({ UserId: user.id });
    res.status(201).json({ user: { ...user.dataValues, password: undefined }, driver });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Get all drivers (admin only)
// @route   GET /api/users/drivers
export const getDrivers = async (req, res) => {
  try {
    const drivers = await DeliveryDriver.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'] }],
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};