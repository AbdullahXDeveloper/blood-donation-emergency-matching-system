import { body } from 'express-validator';
import Donor from '../models/Donor.js';
import DonorMatch from '../models/DonorMatch.js';
import DonationHistory from '../models/DonationHistory.js';
import BloodRequest from '../models/BloodRequest.js';

// @desc    Create or update donor profile
// @route   POST /api/donors/profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { bloodGroup, city, area, phone, lastDonationDate, consentGiven } = req.body;

    let donor = await Donor.findOne({ userId: req.user._id });

    if (donor) {
      donor.bloodGroup = bloodGroup || donor.bloodGroup;
      donor.city = city || donor.city;
      donor.area = area || donor.area;
      donor.phone = phone || donor.phone;
      donor.lastDonationDate = lastDonationDate || donor.lastDonationDate;
      if (consentGiven !== undefined) donor.consentGiven = consentGiven;
      await donor.save();
    } else {
      donor = await Donor.create({
        userId: req.user._id,
        bloodGroup,
        city,
        area,
        phone,
        lastDonationDate: lastDonationDate || null,
        consentGiven: consentGiven || false,
      });
    }

    const populatedDonor = await Donor.findById(donor._id).populate('userId', 'name email');
    res.status(200).json(populatedDonor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get own donor profile
// @route   GET /api/donors/profile
export const getProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user._id }).populate('userId', 'name email');
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found. Please create your profile.' });
    }
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle donor availability
// @route   PUT /api/donors/availability
export const toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }
    donor.isAvailable = !donor.isAvailable;
    await donor.save();
    res.json({ isAvailable: donor.isAvailable, message: `You are now ${donor.isAvailable ? 'available' : 'unavailable'} for donations` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get matched requests for donor
// @route   GET /api/donors/requests
export const getDonorRequests = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user._id });
    if (!donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const matches = await DonorMatch.find({ donorId: donor._id })
      .populate({
        path: 'requestId',
        populate: { path: 'createdBy', select: 'name' },
      })
      .sort({ createdAt: -1 });

    // Only reveal contact info if donor has committed
    const safeMatches = matches.map(m => {
      const match = m.toObject();
      if (match.status !== 'committed' && match.status !== 'donated') {
        if (match.requestId && match.requestId.createdBy) {
          delete match.requestId.createdBy.email;
          delete match.requestId.createdBy.phone;
        }
      }
      return match;
    });

    res.json(safeMatches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Donor responds to a match request
// @route   PUT /api/donors/respond/:matchId
export const respondToMatch = async (req, res) => {
  try {
    const { status } = req.body; // 'committed' or 'declined'
    const donor = await Donor.findOne({ userId: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });

    const match = await DonorMatch.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (match.donorId.toString() !== donor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    match.status = status;
    match.respondedAt = new Date();
    if (status === 'committed') {
      match.contactRevealedAt = new Date();
    }
    await match.save();

    res.json({ message: `You have ${status === 'committed' ? 'accepted' : 'declined'} this request`, match });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donation history for donor
// @route   GET /api/donors/history
export const getDonationHistory = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });

    const history = await DonationHistory.find({ donorId: donor._id })
      .populate('requestId', 'patientName bloodGroup hospital city')
      .sort({ donatedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Validation
export const donorProfileValidation = [
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];
