import express from 'express';
import { getDashboardStats, getAllUsers } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('admin'), getDashboardStats);
router.get('/users', authorize('admin'), getAllUsers);

export default router;
