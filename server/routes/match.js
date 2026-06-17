import express from 'express';
import { triggerMatching, getMatches, updateMatchStatus } from '../controllers/matchController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Admin/Coordinator/Hospital triggers matching
router.post('/:requestId', authorize('admin', 'coordinator', 'hospital'), triggerMatching);

// Get matches for a request
router.get('/:requestId', authorize('admin', 'coordinator', 'donor', 'hospital'), getMatches);

// Update match status
router.put('/:matchId/status', authorize('admin', 'coordinator', 'hospital'), updateMatchStatus);

export default router;
