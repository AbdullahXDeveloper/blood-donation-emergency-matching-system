import { body } from 'express-validator';
import BloodRequest from '../models/BloodRequest.js';
import DonorMatch from '../models/DonorMatch.js';

// @desc    Create blood request
// @route   POST /api/requests
export const createRequest = async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsRequired, hospital, city, urgency, additionalNotes } = req.body;

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

// @desc    Get all requests (admin/hospital)
// @route   GET /api/requests
export const getAllRequests = async (req, res) => {
  try {
    const { status, bloodGroup, city, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = { $regex: city, $options: 'i' };

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

// @desc    Verify a request (hospital)
// @route   PUT /api/requests/:id/verify
export const verifyRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be verified' });
    }

    request.status = 'verified';
    request.verifiedBy = req.user._id;
    await request.save();

    const populated = await BloodRequest.findById(request._id)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email');

    res.json({ message: 'Request verified successfully', request: populated });
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

    // Only creator or admin can cancel
    if (request.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

// @desc    Close/expire request (admin)
// @route   PUT /api/requests/:id/close
export const closeRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'fulfilled' or 'expired'
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

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
