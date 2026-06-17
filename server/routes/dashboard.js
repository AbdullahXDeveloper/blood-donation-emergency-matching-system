import express from 'express';
import { getDashboardStats, getAllUsers, getPendingUsers, approveUser } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('admin', 'coordinator'), getDashboardStats);
router.get('/users', authorize('admin', 'coordinator'), getAllUsers);
router.get('/pending', authorize('admin', 'hospital'), getPendingUsers);
router.put('/users/:id/approve', authorize('admin', 'hospital'), approveUser);

export default router;
