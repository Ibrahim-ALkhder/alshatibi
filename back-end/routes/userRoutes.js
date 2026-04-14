import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createDriver, getDrivers } from '../controllers/userController.js';

const router = express.Router();

router.use(protect);
router.use(admin);
router.route('/drivers').post(createDriver).get(getDrivers);
router.route('/').get(getUsers).post(createUser);
router.route('/stats').get(getUserStats);
router.route('/:id').put(updateUser).delete(deleteUser);

export default router;