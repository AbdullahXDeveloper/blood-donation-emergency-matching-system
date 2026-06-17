import express from 'express';
import {
  createOrUpdateProfile,
  getProfile,
  toggleAvailability,
  getDonorRequests,
  respondToMatch,
  getDonationHistory,
  donorProfileValidation,
} from '../controllers/donorController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);
router.use(authorize('donor'));

router.route('/profile')
  .post(donorProfileValidation, validate, createOrUpdateProfile)
  .get(getProfile);

router.put('/availability', toggleAvailability);
router.get('/requests', getDonorRequests);
router.put('/respond/:matchId', respondToMatch);
router.get('/history', getDonationHistory);

export default router;
