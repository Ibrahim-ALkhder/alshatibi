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
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

export default (io) => {
  router.route('/')
    .post(protect, addOrderItems)
    .get(protect, admin, getOrders);

  router.route('/myorders').get(protect, getMyOrders);
  router.route('/stats/summary').get(protect, admin, getOrderStats);
  router.route('/stats/daily').get(protect, admin, getDailyStats);
  router.route('/export').get(protect, admin, getOrdersForExport);

  router.route('/:id')
    .get(protect, getOrderById);

  router.route('/:id/pay').put(protect, updateOrderToPaid);

  router.route('/:id/status').put(protect, admin, async (req, res) => {
    req.app.set('io', io);
    await updateOrderStatus(req, res);
  });

  return router;
};