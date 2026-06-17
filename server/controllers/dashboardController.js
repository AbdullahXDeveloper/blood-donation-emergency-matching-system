import User from '../models/User.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import DonorMatch from '../models/DonorMatch.js';
import DonationHistory from '../models/DonationHistory.js';

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalDonors,
      availableDonors,
      totalRequests,
      pendingRequests,
      verifiedRequests,
      matchingRequests,
      fulfilledRequests,
      expiredRequests,
      cancelledRequests,
      totalUsers,
      totalDonations,
    ] = await Promise.all([
      Donor.countDocuments(),
      Donor.countDocuments({ isAvailable: true }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      BloodRequest.countDocuments({ status: 'verified' }),
      BloodRequest.countDocuments({ status: 'matching' }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
      BloodRequest.countDocuments({ status: 'expired' }),
      BloodRequest.countDocuments({ status: 'cancelled' }),
      User.countDocuments(),
      DonationHistory.countDocuments(),
    ]);

    // Requests by blood group
    const requestsByBloodGroup = await BloodRequest.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Requests over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const requestsOverTime = await BloodRequest.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Donors by blood group
    const donorsByBloodGroup = await Donor.aggregate([
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Today's fulfilled
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fulfilledToday = await BloodRequest.countDocuments({
      status: 'fulfilled',
      updatedAt: { $gte: today },
    });

    res.json({
      donors: { total: totalDonors, available: availableDonors },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        verified: verifiedRequests,
        matching: matchingRequests,
        fulfilled: fulfilledRequests,
        expired: expiredRequests,
        cancelled: cancelledRequests,
        fulfilledToday,
      },
      users: { total: totalUsers },
      donations: { total: totalDonations },
      charts: {
        requestsByBloodGroup,
        requestsOverTime,
        donorsByBloodGroup,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/dashboard/users
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
