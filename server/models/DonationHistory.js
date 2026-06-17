import mongoose from 'mongoose';

const donationHistorySchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true,
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: true,
  },
  donatedAt: {
    type: Date,
    default: Date.now,
  },
  units: {
    type: Number,
    required: true,
    min: 1,
  },
  hospitalName: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model('DonationHistory', donationHistorySchema);
