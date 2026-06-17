import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
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
  consentGiven: {
    type: Boolean,
    default: false,
  },
  givenAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('Consent', consentSchema);
