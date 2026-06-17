import express from 'express';
import { triggerMatching, getMatches, updateMatchStatus } from '../controllers/matchController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Admin triggers matching
router.post('/:requestId', authorize('admin'), triggerMatching);

// Get matches for a request
router.get('/:requestId', authorize('admin', 'donor'), getMatches);

// Update match status
router.put('/:matchId/status', authorize('admin'), updateMatchStatus);

export default router;
