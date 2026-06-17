import BloodRequest from '../models/BloodRequest.js';
import Donor from '../models/Donor.js';
import DonorMatch from '../models/DonorMatch.js';
import DonationHistory from '../models/DonationHistory.js';
import { getCompatibleGroups, DONATION_COOLDOWN_DAYS } from '../utils/bloodCompatibility.js';

// Core matching algorithm
const findEligibleDonors = async (requestId) => {
  const request = await BloodRequest.findById(requestId);
  if (!request) throw new Error('Request not found');

  const compatibleGroups = getCompatibleGroups(request.bloodGroup);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DONATION_COOLDOWN_DAYS);

  const eligibleDonors = await Donor.find({
    bloodGroup: { $in: compatibleGroups },
    city: { $regex: new RegExp(`^${request.city}$`, 'i') },
    isAvailable: true,
    $or: [
      { lastDonationDate: null },
      { lastDonationDate: { $lt: cutoffDate } },
    ],
  });

  return { request, eligibleDonors };
};

// @desc    Trigger matching for a request
// @route   POST /api/match/:requestId
export const triggerMatching = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (req.user.role === 'hospital' && request.hospital.toLowerCase() !== req.user.name.toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to trigger matching for other hospitals' });
    }
    if (req.user.role === 'coordinator' && request.hospital.toLowerCase() !== req.user.hospitalAffiliation.toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to trigger matching for other hospitals' });
    }

    if (!['verified', 'matching'].includes(request.status)) {
      return res.status(400).json({ message: 'Request must be verified before matching' });
    }

    const { eligibleDonors } = await findEligibleDonors(requestId);

    // Remove existing matches for this request (re-matching)
    await DonorMatch.deleteMany({ requestId, status: 'contacted' });

    if (eligibleDonors.length === 0) {
      return res.status(200).json({ message: 'No eligible donors found in this city', matches: [] });
    }

    // Avoid duplicate matches
    const existingMatches = await DonorMatch.find({ requestId });
    const existingDonorIds = existingMatches.map(m => m.donorId.toString());

    const newMatches = eligibleDonors
      .filter(d => !existingDonorIds.includes(d._id.toString()))
      .map(donor => ({
        requestId: request._id,
        donorId: donor._id,
        status: 'contacted',
      }));

    let insertedMatches = [];
    if (newMatches.length > 0) {
      insertedMatches = await DonorMatch.insertMany(newMatches);
    }

    // Update request status to matching
    request.status = 'matching';
    await request.save();

    res.json({
      message: `Matching triggered. Found ${eligibleDonors.length} eligible donor(s).`,
      matchesCreated: insertedMatches.length,
      matches: insertedMatches,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all matches for a request
// @route   GET /api/match/:requestId
export const getMatches = async (req, res) => {
  try {
    if (req.user.role === 'hospital') {
      const request = await BloodRequest.findById(req.params.requestId);
      if (request && request.hospital.toLowerCase() !== req.user.name.toLowerCase()) {
        return res.status(403).json({ message: 'Not authorized to view matches for other hospitals' });
      }
    }
    if (req.user.role === 'coordinator') {
      const request = await BloodRequest.findById(req.params.requestId);
      if (request && request.hospital.toLowerCase() !== req.user.hospitalAffiliation.toLowerCase()) {
        return res.status(403).json({ message: 'Not authorized to view matches for other hospitals' });
      }
    }

    const matches = await DonorMatch.find({ requestId: req.params.requestId })
      .populate({
        path: 'donorId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // Mask contact info for donors who haven't committed yet
    const safeMatches = matches.map(m => {
      const match = m.toObject();
      if (match.status === 'contacted' || match.status === 'declined' || match.status === 'no-show') {
        if (match.donorId) {
          match.donorId.phone = '***-hidden***';
          if (match.donorId.userId) match.donorId.userId.email = '***-hidden***';
        }
      }
      return match;
    });

    res.json(safeMatches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update match status (admin/hospital)
// @route   PUT /api/match/:matchId/status
export const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const match = await DonorMatch.findById(req.params.matchId);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (req.user.role === 'hospital') {
      const request = await BloodRequest.findById(match.requestId);
      if (request && request.hospital.toLowerCase() !== req.user.name.toLowerCase()) {
        return res.status(403).json({ message: 'Not authorized to update match status for other hospitals' });
      }
    }
    if (req.user.role === 'coordinator') {
      const request = await BloodRequest.findById(match.requestId);
      if (request && request.hospital.toLowerCase() !== req.user.hospitalAffiliation.toLowerCase()) {
        return res.status(403).json({ message: 'Not authorized to update match status for other hospitals' });
      }
    }

    const prevStatus = match.status;
    match.status = status;
    if (status === 'committed' && !match.contactRevealedAt) {
      match.contactRevealedAt = new Date();
    }
    match.respondedAt = new Date();
    await match.save();

    // If donated, create donation history record
    if (status === 'donated' && prevStatus !== 'donated') {
      const request = await BloodRequest.findById(match.requestId);
      const donor = await Donor.findById(match.donorId);

      if (request && donor) {
        await DonationHistory.create({
          donorId: donor._id,
          requestId: request._id,
          units: request.unitsRequired,
          hospitalName: request.hospital,
          donatedAt: new Date(),
        });

        donor.totalDonations += 1;
        donor.lastDonationDate = new Date();
        await donor.save();
      }
    }

    const populated = await DonorMatch.findById(match._id).populate({
      path: 'donorId',
      populate: { path: 'userId', select: 'name email' },
    });

    res.json({ message: 'Match status updated', match: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
