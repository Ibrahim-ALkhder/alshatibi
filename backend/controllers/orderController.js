import sequelize from '../config/database.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import OrderAddress from '../models/OrderAddress.js';
import MenuItem from '../models/MenuItem.js';
import DeliveryDriver from '../models/DeliveryDriver.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// ==================== دالة مساعدة لتخصيص الطلبات المعلقة (بدون معاملة) ====================
export const tryAssignPendingOrders = async (io) => {
  try {
    const pendingOrder = await Order.findOne({
      where: { status: 'Ready', DeliveryDriverId: null },
      include: [
        { model: OrderItem },
        { model: User },
        { model: OrderAddress },
      ],
      order: [['readyAt', 'ASC']],
    });
    if (!pendingOrder) return;

    const availableDriver = await DeliveryDriver.findOne({
      where: { status: 'available' },
      include: [{ model: User }],
    });
    if (!availableDriver) {
      console.log(`⚠️ لا يوجد مندوب متاح لتخصيص الطلب ${pendingOrder.id}`);
      return;
    }

    pendingOrder.DeliveryDriverId = availableDriver.id;
    availableDriver.status = 'busy';
    availableDriver.currentOrderId = pendingOrder.id;
    await pendingOrder.save();
    await availableDriver.save();

    if (io) {
      io.to(availableDriver.UserId.toString()).emit('newDeliveryRequest', {
        orderId: pendingOrder.id,
        orderDetails: {
          items: pendingOrder.OrderItems,
          totalPrice: pendingOrder.totalPrice,
          deliveryAddress: pendingOrder.OrderAddress,
          phone: pendingOrder.phone,
        },
      });
      console.log(`📨 تم تخصيص طلب مؤجل ${pendingOrder.id} للمندوب ${availableDriver.UserId}`);
    }
  } catch (error) {
    console.error('❌ tryAssignPendingOrders Error:', error);
  }
};

// ==================== إنشاء طلب جديد ====================
export const addOrderItems = async (req, res) => {
  const transaction = await sequelize.transaction();
  let orderId = null;

  try {
    const { items, totalPrice, deliveryAddress, phone, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'لا توجد عناصر في الطلب' });
    }

    const orderItemsData = [];
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menuItem, { transaction });
      if (!menuItem) {
        await transaction.rollback();
        return res.status(404).json({ message: `الصنف غير موجود: ${item.menuItem}` });
      }
      if (menuItem.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `الكمية غير كافية للصنف: ${menuItem.nameAr}. المتاح: ${menuItem.stock}`,
        });
      }
      menuItem.stock -= item.quantity;
      await menuItem.save({ transaction });

      orderItemsData.push({
        name: menuItem.nameAr,
        quantity: item.quantity,
        price: menuItem.price,
        MenuItemId: menuItem.id,
      });
    }

    const order = await Order.create(
      {
        totalPrice,
        phone,
        paymentMethod,
        deliveryFee: 20,
        UserId: req.user.id,
      },
      { transaction }
    );
    orderId = order.id;

    await OrderAddress.create(
      { ...deliveryAddress, OrderId: order.id },
      { transaction }
    );

    for (const itemData of orderItemsData) {
      await OrderItem.create({ ...itemData, OrderId: order.id }, { transaction });
    }

    // ✅ commit المعاملة هنا
    await transaction.commit();

    // بعد commit، نجهز الاستجابة والإشعارات (لا تؤثر على قاعدة البيانات)
    const createdOrder = await Order.findByPk(orderId, {
      include: [
        { model: OrderAddress },
        { model: OrderItem },
        { model: User, attributes: ['id', 'name', 'email', 'phone'] },
      ],
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user.id.toString()).emit('newOrderCreated', {
        orderId: orderId,
        order: createdOrder,
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    // ⚠️ إذا كانت المعاملة لم تنته (لم يتم commit أو rollback بعد)، نقوم بـ rollback
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('❌ addOrderItems Error:', error);
    // تجنب إرسال استجابة إذا كانت قد أُرسلت بالفعل
    if (!res.headersSent) {
      res.status(400).json({ message: error.message });
    }
  }
};

// ==================== طلبات المستخدم الحالي ====================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id },
      include: [
        { model: OrderItem },
        { model: OrderAddress },
        { model: DeliveryDriver, include: [{ model: User, attributes: ['name', 'phone'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    console.error('❌ getMyOrders Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== الحصول على طلب واحد ====================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderAddress },
        { model: OrderItem },
        {
          model: DeliveryDriver,
          include: [{ model: User, attributes: ['id', 'name', 'phone'] }],
        },
      ],
    });
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    const isAdminOrStaff = ['admin', 'staff'].includes(req.user.role);
    const isOwner = order.UserId === req.user.id;
    const isAssignedDriver = order.DeliveryDriver?.UserId === req.user.id;

    if (!isAdminOrStaff && !isOwner && !isAssignedDriver) {
      return res.status(403).json({ message: 'غير مصرح بعرض هذا الطلب' });
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
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('❌ updateOrderToPaid Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== تحديث حالة الطلب (مدير / موظف) ====================
export const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem },
        { model: User },
        { model: OrderAddress },
      ],
      transaction,
    });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (status === 'Delivered') order.deliveredAt = new Date();

    // عند Ready
    if (status === 'Ready' && oldStatus !== 'Ready') {
      order.readyAt = new Date();
      if (!order.DeliveryDriverId) {
        const availableDriver = await DeliveryDriver.findOne({
          where: { status: 'available' },
          transaction,
        });
        if (availableDriver) {
          order.DeliveryDriverId = availableDriver.id;
          availableDriver.status = 'busy';
          availableDriver.currentOrderId = order.id;
          await availableDriver.save({ transaction });
        } else {
          console.log(`⚠️ [طلب ${order.id}] لا يوجد مندوب متاح الآن. في انتظار مندوب...`);
        }
      }
    }
    if (status === 'Ready' && oldStatus !== 'Ready') {
  order.readyAt = new Date();
  if (!order.DeliveryDriverId) {
    const availableDriver = await DeliveryDriver.findOne({
      where: { status: 'available' },
      transaction,
    });
    if (availableDriver) {
      order.DeliveryDriverId = availableDriver.id;
      availableDriver.status = 'busy';
      availableDriver.currentOrderId = order.id;
      await availableDriver.save({ transaction });
    } else {
      console.log(`⚠️ [طلب ${order.id}] لا يوجد مندوب متاح الآن. في انتظار مندوب...`);
      // إرسال إشعار للعميل عبر Socket.io
      const io = req.app.get('io');
      if (io) {
        io.to(order.UserId.toString()).emit('driverUnavailable', {
          orderId: order.id,
          message: 'طلبك جاهز ولكن جميع المناديب مشغولون حاليًا. سنقوم بتوصيله في أقرب وقت.',
        });
      }
    }
  }
}

    await order.save({ transaction });
    await transaction.commit();

    const updatedOrder = await Order.findByPk(order.id, {
      include: [OrderAddress, OrderItem],
    });

    const io = req.app.get('io');
    if (io) {
      io.to(order.UserId.toString()).emit('orderStatusUpdated', {
        orderId: order.id,
        status: order.status,
      });
      if (status === 'Ready' && updatedOrder.DeliveryDriverId) {
        const driver = await DeliveryDriver.findByPk(updatedOrder.DeliveryDriverId);
        if (driver) {
          io.to(driver.UserId.toString()).emit('newDeliveryRequest', {
            orderId: order.id,
            orderDetails: {
              items: updatedOrder.OrderItems,
              totalPrice: updatedOrder.totalPrice,
              deliveryAddress: updatedOrder.OrderAddress,
              phone: updatedOrder.phone,
            },
          });
          console.log(`📨 [طلب ${order.id}] إشعار أرسل إلى المندوب ${driver.UserId}`);
        }
      }
    }

    // محاولة تخصيص طلبات معلقة بعد التحديث
    tryAssignPendingOrders(io);

    res.json(updatedOrder);
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('❌ updateOrderStatus Error:', error);
    if (!res.headersSent) {
      res.status(400).json({ message: error.message });
    }
  }
};

// ==================== جميع الطلبات (مدير وموظف) ====================
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: OrderItem },
        { model: OrderAddress },
        { model: DeliveryDriver, include: [{ model: User, attributes: ['name', 'phone'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
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
    const where = {};
    if (startDate && startDate !== 'null') where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate && endDate !== 'null') where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };

    const deliveredOrders = await Order.findAll({ where: { ...where, status: 'Delivered' } });
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = deliveredOrders.length;
    const avg = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const allOrders = await Order.findAll({ where, attributes: ['status'] });
    const ordersByStatus = {};
    allOrders.forEach(o => { ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1; });

    res.json({ totalRevenue, totalOrders, averageOrderValue: avg, ordersByStatus });
  } catch (error) {
    console.error('❌ getOrderStats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== الإيرادات اليومية ====================
export const getDailyStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { status: 'Delivered' };
    if (startDate && startDate !== 'null') where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate && endDate !== 'null') where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };

    const orders = await Order.findAll({ where, attributes: ['createdAt', 'totalPrice'] });
    const dailyMap = {};
    orders.forEach(o => {
      const d = o.createdAt.toISOString().split('T')[0];
      if (!dailyMap[d]) dailyMap[d] = { revenue: 0, count: 0 };
      dailyMap[d].revenue += o.totalPrice;
      dailyMap[d].count += 1;
    });
    const dailyData = Object.entries(dailyMap).map(([d, v]) => ({ _id: d, ...v })).sort((a,b) => a._id.localeCompare(b._id));
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
    const where = { status: 'Delivered' };
    if (startDate && startDate !== 'null') where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate && endDate !== 'null') where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: OrderItem },
        { model: OrderAddress },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    console.error('❌ getOrdersForExport Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== دوال المندوب ====================
export const getDriverOrders = async (req, res) => {
  try {
    const driver = await DeliveryDriver.findOne({ where: { UserId: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'لم يتم العثور على ملف المندوب' });

    const orders = await Order.findAll({
      where: { DeliveryDriverId: driver.id, status: { [Op.ne]: 'Delivered' } },
      include: [{ model: User, attributes: ['name', 'phone'] }, OrderAddress, OrderItem],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    console.error('❌ getDriverOrders Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatusByDriver = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const driver = await DeliveryDriver.findOne({ where: { UserId: req.user.id }, transaction });
    if (!driver || order.DeliveryDriverId !== driver.id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'غير مصرح' });
    }

    if (!['Out for delivery', 'Delivered'].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'حالة غير صالحة' });
    }
    if (status === 'Out for delivery' && order.status !== 'Ready') {
      await transaction.rollback();
      return res.status(400).json({ message: 'يجب أن يكون الطلب جاهزاً أولاً' });
    }
    if (status === 'Delivered' && order.status !== 'Out for delivery') {
      await transaction.rollback();
      return res.status(400).json({ message: 'يجب أن يكون الطلب قيد التوصيل أولاً' });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      driver.status = 'available';
      driver.currentOrderId = null;
      driver.totalDeliveries += 1;
      await driver.save({ transaction });
    }
    await order.save({ transaction });
    await transaction.commit();

    const updatedOrder = await Order.findByPk(order.id, { include: [OrderAddress, OrderItem] });
    const io = req.app.get('io');
    if (io) {
      io.to(order.UserId.toString()).emit('orderStatusUpdated', { orderId: order.id, status: order.status });
    }

    if (status === 'Delivered') {
      tryAssignPendingOrders(io);
    }

    res.json(updatedOrder);
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    console.error('❌ updateOrderStatusByDriver Error:', error);
    if (!res.headersSent) res.status(400).json({ message: error.message });
  }
};

export const getDriverHistory = async (req, res) => {
  try {
    const driver = await DeliveryDriver.findOne({ where: { UserId: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const completedOrders = await Order.findAll({
      where: { DeliveryDriverId: driver.id, status: 'Delivered' },
      include: [{ model: User, attributes: ['name', 'phone'] }],
      order: [['deliveredAt', 'DESC']],
      limit: 5,
    });
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

    const driver = await DeliveryDriver.findOne({ where: { UserId: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'لم يتم العثور على ملف المندوب' });
    if (driver.status === 'busy') {
      return res.status(400).json({ message: 'لا يمكنك تغيير حالتك أثناء توصيل طلب' });
    }

    driver.status = status;
    await driver.save();

    if (status === 'available') {
      const io = req.app.get('io');
      tryAssignPendingOrders(io);
    }

    res.json({ status: driver.status });
  } catch (error) {
    console.error('❌ updateDriverStatus Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDriverStatus = async (req, res) => {
  try {
    const driver = await DeliveryDriver.findOne({ where: { UserId: req.user.id } });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ status: driver.status });
  } catch (error) {
    console.error('❌ getDriverStatus Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const ensureDriverProfile = async (req, res) => {
  try {
    let driver = await DeliveryDriver.findOne({ where: { UserId: req.user.id } });
    if (!driver) {
      driver = await DeliveryDriver.create({ UserId: req.user.id, status: 'available' });
      console.log(`✅ تم إنشاء ملف مندوب جديد للمستخدم ${req.user.id}`);
    }
    res.json({ status: driver.status });
  } catch (error) {
    console.error('❌ ensureDriverProfile Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== تخصيص يدوي للطلبات المعلقة (للإدارة) ====================
export const assignPendingOrders = async (req, res) => {
  try {
    const io = req.app.get('io');
    await tryAssignPendingOrders(io);
    res.json({ message: 'تمت محاولة تخصيص الطلبات المعلقة' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};