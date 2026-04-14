import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import DeliveryDriver from '../models/DeliveryDriver.js';

// ==================== إنشاء طلب جديد ====================
export const addOrderItems = async (req, res) => {
  try {
    const { items, totalPrice, deliveryAddress, phone, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'لا توجد عناصر في الطلب' });
    }

    const populatedItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) throw new Error(`Menu item not found: ${item.menuItem}`);
        if (menuItem.stock < item.quantity) {
          throw new Error(`الكمية غير كافية للصنف: ${menuItem.nameAr}. المتاح: ${menuItem.stock}`);
        }
        menuItem.stock -= item.quantity;
        await menuItem.save();
        return {
          menuItem: item.menuItem,
          name: menuItem.name,
          quantity: item.quantity,
          price: menuItem.price,
          options: item.options || [],
        };
      })
    );

    const order = new Order({
      user: req.user._id,
      items: populatedItems,
      totalPrice, // الإجمالي القادم من الواجهة (يشمل رسوم التوصيل)
      deliveryAddress,
      phone,
      paymentMethod,
      deliveryFee: 20,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('❌ addOrderItems Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ==================== الحصول على طلب واحد ====================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('driver', 'user')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } });
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'staff' &&
      req.user.role !== 'driver'
    ) {
      if (order.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'غير مصرح' });
      }
    }
    res.json(order);
  } catch (error) {
    console.error('❌ getOrderById Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== تحديث حالة الدفع ====================
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    order.isPaid = true;
    order.paidAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ updateOrderToPaid Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== تحديث حالة الطلب (مدير / موظف) ====================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    const oldStatus = order.status;
    order.status = status;

    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    // تخصيص مندوب تلقائي عند تغيير الحالة إلى "جاهز" لأول مرة
    if (status === 'Ready' && oldStatus !== 'Ready' && !order.driver) {
      console.log(`🔍 [طلب ${order._id}] البحث عن مندوب متاح...`);

      const availableDriver = await DeliveryDriver.findOne({ status: 'available' });

      if (availableDriver) {
        console.log(`✅ [طلب ${order._id}] وجد مندوب متاح: ${availableDriver.user}`);
        order.driver = availableDriver._id;
        availableDriver.status = 'busy';
        availableDriver.currentOrder = order._id;
        await availableDriver.save();

        const io = req.app.get('io');
        if (io) {
          io.to(availableDriver.user.toString()).emit('newDeliveryRequest', {
            orderId: order._id,
            orderDetails: {
              items: order.items,
              totalPrice: order.totalPrice,
              deliveryAddress: order.deliveryAddress,
              phone: order.phone,
            },
          });
          console.log(`📨 [طلب ${order._id}] إشعار أرسل إلى ${availableDriver.user}`);
        }
      } else {
        console.warn(`⚠️ [طلب ${order._id}] لا يوجد مندوب متاح حاليًا`);
      }
    }

    const updatedOrder = await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(order.user.toString()).emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ updateOrderStatus Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// ==================== طلبات المستخدم الحالي ====================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('❌ getMyOrders Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== جميع الطلبات (مدير فقط) ====================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('❌ getOrders Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== إحصائيات الملخص ====================
export const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate && startDate !== 'null' && startDate !== 'undefined') {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate && endDate !== 'null' && endDate !== 'undefined') {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };
    }

    const deliveredOrders = await Order.find({ ...dateFilter, status: 'Delivered' });
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalOrders = deliveredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusCounts = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const ordersByStatus = {};
    statusCounts.forEach((item) => {
      ordersByStatus[item._id] = item.count;
    });

    res.json({ totalRevenue, totalOrders, averageOrderValue, ordersByStatus });
  } catch (error) {
    console.error('❌ getOrderStats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== الإيرادات اليومية ====================
export const getDailyStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = { status: 'Delivered' };
    if (startDate && startDate !== 'null' && startDate !== 'undefined') {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate && endDate !== 'null' && endDate !== 'undefined') {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };
    }

    const dailyData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(dailyData);
  } catch (error) {
    console.error('❌ getDailyStats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== تصدير الطلبات ====================
export const getOrdersForExport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = { status: 'Delivered' };
    if (startDate && startDate !== 'null' && startDate !== 'undefined') {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate && endDate !== 'null' && endDate !== 'undefined') {
      dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };
    }
    const orders = await Order.find(dateFilter).populate('user', 'name email phone').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('❌ getOrdersForExport Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== دوال المندوب ====================

export const getDriverOrders = async (req, res) => {
  try {
    const driver = await DeliveryDriver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver profile not found' });
    const orders = await Order.find({
      driver: driver._id,
      status: { $ne: 'Delivered' },
    })
      .populate('user', 'name phone address')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('❌ getDriverOrders Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatusByDriver = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    const driver = await DeliveryDriver.findOne({ user: req.user._id });
    if (!driver || order.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    if (!['Out for delivery', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'حالة غير صالحة' });
    }

    if (status === 'Out for delivery' && order.status !== 'Ready') {
      return res.status(400).json({ message: 'يجب أن يكون الطلب جاهزاً أولاً' });
    }
    if (status === 'Delivered' && order.status !== 'Out for delivery') {
      return res.status(400).json({ message: 'يجب أن يكون الطلب قيد التوصيل أولاً' });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      driver.status = 'available';
      driver.currentOrder = null;
      driver.totalDeliveries += 1;
      await driver.save();
    }

    const updatedOrder = await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to(order.user.toString()).emit('orderStatusUpdated', {
        orderId: order._id,
        status: order.status,
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('❌ updateOrderStatusByDriver Error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getDriverHistory = async (req, res) => {
  try {
    const driver = await DeliveryDriver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const completedOrders = await Order.find({
      driver: driver._id,
      status: 'Delivered',
    })
      .populate('user', 'name phone')
      .sort('-deliveredAt')
      .limit(5);

    res.json(completedOrders);
  } catch (error) {
    console.error('❌ getDriverHistory Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'offline'].includes(status)) {
      return res.status(400).json({ message: 'يمكنك فقط اختيار "متاح" أو "غير متصل"' });
    }

    const driver = await DeliveryDriver.findOne({ user: req.user._id });
    if (!driver) {
      return res.status(404).json({ message: 'لم يتم العثور على ملف المندوب' });
    }

    if (driver.status === 'busy') {
      return res.status(400).json({ message: 'لا يمكنك تغيير حالتك أثناء توصيل طلب' });
    }

    driver.status = status;
    await driver.save();

    res.json({ status: driver.status });
  } catch (error) {
    console.error('❌ updateDriverStatus Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDriverStatus = async (req, res) => {
  try {
    const driver = await DeliveryDriver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ status: driver.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const ensureDriverProfile = async (req, res) => {
  try {
    let driver = await DeliveryDriver.findOne({ user: req.user._id });
    if (!driver) {
      driver = await DeliveryDriver.create({ user: req.user._id, status: 'available' });
      console.log(`✅ تم إنشاء ملف مندوب جديد للمستخدم ${req.user._id}`);
    }
    res.json({ status: driver.status });
  } catch (error) {
    console.error('❌ ensureDriverProfile Error:', error);
    res.status(500).json({ message: error.message });
  }
};