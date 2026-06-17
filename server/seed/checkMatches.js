import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import BloodRequest from '../models/BloodRequest.js';
import DonorMatch from '../models/DonorMatch.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js';

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.countDocuments();
    const donors = await Donor.countDocuments();
    const requests = await BloodRequest.countDocuments();
    const matches = await DonorMatch.countDocuments();

    console.log(`Counts:\n  Users: ${users}\n  Donors: ${donors}\n  Requests: ${requests}\n  Matches: ${matches}`);

    const allMatches = await DonorMatch.find().populate({
      path: 'donorId',
      populate: { path: 'userId', select: 'name email' }
    }).populate('requestId');

    console.log('\n--- DonorMatch Records ---');
    allMatches.forEach((m, idx) => {
      console.log(`\nMatch #${idx + 1}:`);
      console.log(`  ID: ${m._id}`);
      console.log(`  Status: ${m.status}`);
      console.log(`  Donor: ${m.donorId ? `${m.donorId.userId?.name} (${m.donorId.bloodGroup}, ${m.donorId.city})` : 'NULL'}`);
      console.log(`  Request: ${m.requestId ? `${m.requestId.patientName} (${m.requestId.bloodGroup}, ${m.requestId.city})` : 'NULL'}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
};

check();
