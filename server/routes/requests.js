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

// Admin, hospital, coordinator see all
router.get('/', authorize('admin', 'hospital', 'coordinator'), getAllRequests);

// Single request — any authenticated user
router.get('/:id', getRequest);

// Hospital OR admin verifies (auto-triggers matching)
router.put('/:id/verify', authorize('admin', 'hospital'), verifyRequest);

// Cancel — patient, admin, hospital, or coordinator
router.put('/:id/cancel', authorize('patient', 'admin', 'hospital', 'coordinator'), cancelRequest);

// Admin, hospital, coordinator closes/expires
router.put('/:id/close', authorize('admin', 'hospital', 'coordinator'), closeRequest);

export default router;
