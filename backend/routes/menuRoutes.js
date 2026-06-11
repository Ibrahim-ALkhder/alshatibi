import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Middleware للتحقق من أن المستخدم admin أو staff
const adminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

router.route('/')
  .get(getMenuItems)
  .post(protect, adminOrStaff, upload.single('image'), createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, adminOrStaff, upload.single('image'), updateMenuItem)
  .delete(protect, adminOrStaff, deleteMenuItem);

export default router;