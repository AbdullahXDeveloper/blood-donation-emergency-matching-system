import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  area: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
  },
  lastDonationDate: {
    type: Date,
    default: null,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  totalDonations: {
    type: Number,
    default: 0,
  },
  consentGiven: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Donor', donorSchema);
