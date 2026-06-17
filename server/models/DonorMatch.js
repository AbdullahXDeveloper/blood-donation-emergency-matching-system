import mongoose from 'mongoose';

const donorMatchSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: true,
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true,
  },
  status: {
    type: String,
    enum: ['contacted', 'committed', 'donated', 'declined', 'no-show'],
    default: 'contacted',
  },
  contactRevealedAt: {
    type: Date,
    default: null,
  },
  respondedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('DonorMatch', donorMatchSchema);
