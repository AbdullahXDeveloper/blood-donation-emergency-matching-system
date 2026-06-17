import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required'],
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Units required is required'],
    min: 1,
    max: 20,
  },
  hospital: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  urgency: {
    type: String,
    enum: ['critical', 'urgent', 'normal'],
    default: 'normal',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'matching', 'fulfilled', 'expired', 'cancelled'],
    default: 'pending',
  },
  additionalNotes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
  },
}, { timestamps: true });

export default mongoose.model('BloodRequest', bloodRequestSchema);
