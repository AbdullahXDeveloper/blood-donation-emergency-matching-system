import express from 'express';
import {
  createRequest,
  getAllRequests,
  getRequest,
  getMyRequests,
  verifyRequest,
  cancelRequest,
  closeRequest,
  requestValidation,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

// Patient creates request
router.post('/', authorize('patient', 'admin'), requestValidation, validate, createRequest);

// Get own requests (patient)
router.get('/my', authorize('patient'), getMyRequests);

// Admin see all
router.get('/', authorize('admin'), getAllRequests);

// Single request - any authenticated user
router.get('/:id', getRequest);

// Admin verifies
router.put('/:id/verify', authorize('admin'), verifyRequest);

// Cancel - patient or admin
router.put('/:id/cancel', authorize('patient', 'admin'), cancelRequest);

// Admin closes/expires
router.put('/:id/close', authorize('admin'), closeRequest);

export default router;
