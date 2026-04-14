import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDriverOrders,
  updateOrderStatusByDriver,
  getDriverHistory,
  updateDriverStatus,
  getDriverStatus,
  ensureDriverProfile,
} from '../controllers/orderController.js';

const router = express.Router();

// جميع المسارات تتطلب تسجيل الدخول
router.use(protect);

// طلبات المندوب الحالية
router.get('/orders', getDriverOrders);

// تحديث حالة الطلب (خرج للتوصيل / تم التوصيل)
router.put('/orders/:id/status', updateOrderStatusByDriver);

// سجل آخر 5 طلبات مكتملة
router.get('/history', getDriverHistory);

// حالة المندوب (متاح / غير متصل)
router.route('/status')
  .get(getDriverStatus)
  .put(updateDriverStatus);

// إنشاء ملف مندوب تلقائيًا إذا لم يكن موجودًا
router.post('/ensure-profile', ensureDriverProfile);

export default router;