import express from 'express';
import { getDashboardStats, getAllUsers } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('admin', 'coordinator'), getDashboardStats);
router.get('/users', authorize('admin', 'coordinator'), getAllUsers);

export default router;
