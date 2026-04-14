import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  getOrderStats,
  getDailyStats,
  getOrdersForExport,
  assignPendingOrders, // ✅ استيراد الدالة الجديدة
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

const adminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ message: 'غير مصرح' });
  }
};

export default (io) => {
  router.route('/')
    .post(protect, addOrderItems)
    .get(protect, adminOrStaff, getOrders);

  router.route('/myorders').get(protect, getMyOrders);
  
  router.route('/stats/summary').get(protect, admin, getOrderStats);
  router.route('/stats/daily').get(protect, admin, getDailyStats);
  router.route('/export').get(protect, admin, getOrdersForExport);

  // ✅ مسار جديد للتخصيص اليدوي
  router.route('/assign-pending').post(protect, adminOrStaff, (req, res) => {
    req.app.set('io', io);
    return assignPendingOrders(req, res);
  });

  router.route('/:id')
    .get(protect, getOrderById);

  router.route('/:id/pay').put(protect, updateOrderToPaid);

  router.route('/:id/status').put(protect, adminOrStaff, async (req, res) => {
    req.app.set('io', io);
    await updateOrderStatus(req, res);
  });

  return router;
};