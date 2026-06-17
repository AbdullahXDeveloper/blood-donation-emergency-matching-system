import { body } from 'express-validator';
import BloodRequest from '../models/BloodRequest.js';
import DonorMatch from '../models/DonorMatch.js';
import Donor from '../models/Donor.js';
import { getCompatibleGroups, DONATION_COOLDOWN_DAYS } from '../utils/bloodCompatibility.js';

// ── Internal helper: run matching for a request ──────────────────────────────
const runMatchingEngine = async (requestId, city, bloodGroup) => {
  const compatibleGroups = getCompatibleGroups(bloodGroup);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DONATION_COOLDOWN_DAYS);

  const eligibleDonors = await Donor.find({
    bloodGroup: { $in: compatibleGroups },
    city: { $regex: new RegExp(`^${city}$`, 'i') },
    isAvailable: true,
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lt: cutoffDate } },
    ],
  });

  if (eligibleDonors.length === 0) return 0;

  const existingMatches = await DonorMatch.find({ requestId });
  const existingDonorIds = new Set(existingMatches.map(m => m.donorId.toString()));

  const newMatches = eligibleDonors
    .filter(d => !existingDonorIds.has(d._id.toString()))
    .map(donor => ({ requestId, donorId: donor._id, status: 'contacted' }));

  if (newMatches.length > 0) await DonorMatch.insertMany(newMatches);
  return newMatches.length;
};

// @desc    Create blood request
// @route   POST /api/requests
export const createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, hospital, city, urgency, additionalNotes } = req.body;

    // ── Duplicate detection ───────────────────────────────────────────────────
    const recentDuplicate = await BloodRequest.findOne({
      patientName: { $regex: new RegExp(`^${patientName}$`, 'i') },
      bloodGroup,
      hospital: { $regex: new RegExp(`^${hospital}$`, 'i') },
      status: { $in: ['pending', 'verified', 'matching'] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // within last 24h
    });

    if (recentDuplicate) {
      return res.status(409).json({
        message: 'A similar active request already exists for this patient at this hospital within 24 hours.',
        existingRequestId: recentDuplicate._id,
      });
    }

    const request = await BloodRequest.create({
      patientName,
      bloodGroup,
      unitsRequired,
      hospital,
      city,
      urgency: urgency || 'normal',
      additionalNotes,
      createdBy: req.user._id,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all requests (admin/hospital/coordinator)
// @route   GET /api/requests
export const getAllRequests = async (req, res) => {
  try {
    const { status, bloodGroup, city, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = { $regex: city, $options: 'i' };
    
    if (req.user.role === 'hospital') {
      filter.hospital = { $regex: new RegExp(`^${req.user.name}$`, 'i') };
    } else if (req.user.role === 'coordinator') {
      filter.hospital = { $regex: new RegExp(`^${req.user.hospitalAffiliation}$`, 'i') };
    }

    const requests = await BloodRequest.find(filter)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await BloodRequest.countDocuments(filter);

    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
export const getRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email');

    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get own requests (patient)
// @route   GET /api/requests/my
export const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ createdBy: req.user._id })
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify a request (hospital/admin) — auto-triggers matching engine
// @route   PUT /api/requests/:id/verify
export const verifyRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (req.user.role === 'hospital' && request.hospital.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to verify requests for other hospitals' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be verified' });
    }

    request.status = 'matching'; // skip 'verified', go straight to matching
    request.verifiedBy = req.user._id;
    await request.save();

    // Auto-run matching engine immediately after verification
    const matchesCreated = await runMatchingEngine(request._id, request.city, request.bloodGroup);

    const populated = await BloodRequest.findById(request._id)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({
      message: `Request verified and matching triggered. ${matchesCreated} donor(s) contacted.`,
      request: populated,
      matchesCreated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel a request
// @route   PUT /api/requests/:id/cancel
export const cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (req.user.role === 'hospital' && request.hospital.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to cancel requests for other hospitals' });
    }
    if (req.user.role === 'coordinator' && request.hospital.toLowerCase() !== req.user.hospitalAffiliation.toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to cancel requests for other hospitals' });
    }

    // Only creator or admin/hospital/coordinator can cancel
    if (
      request.createdBy.toString() !== req.user._id.toString() &&
      !['admin', 'hospital', 'coordinator'].includes(req.user.role)
    ) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    if (['fulfilled', 'cancelled', 'expired'].includes(request.status)) {
      return res.status(400).json({ message: 'Cannot cancel a completed/expired/cancelled request' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Close/expire request (admin/hospital/coordinator)
// @route   PUT /api/requests/:id/close
export const closeRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'fulfilled' or 'expired'
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (req.user.role === 'hospital' && request.hospital.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to close requests for other hospitals' });
    }
    if (req.user.role === 'coordinator' && request.hospital.toLowerCase() !== req.user.hospitalAffiliation.toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to close requests for other hospitals' });
    }

    request.status = status || 'expired';
    await request.save();
    res.json({ message: `Request marked as ${request.status}`, request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Validation
export const requestValidation = [
  body('patientName').trim().notEmpty().withMessage('Patient name is required'),
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('unitsRequired').isInt({ min: 1, max: 20 }).withMessage('Units must be between 1-20'),
  body('hospital').trim().notEmpty().withMessage('Hospital name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('urgency').optional().isIn(['critical', 'urgent', 'normal']).withMessage('Invalid urgency level'),
];
