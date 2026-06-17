import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import DonorMatch from '../models/DonorMatch.js';
import { getCompatibleGroups } from '../utils/bloodCompatibility.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find donor "lili"
    const donorUser = await User.findOne({ email: 'li@gmail.com' });
    if (!donorUser) {
      console.log('❌ Donor user li@gmail.com not found');
      await mongoose.connection.close();
      return;
    }

    const donor = await Donor.findOne({ userId: donorUser._id });
    if (!donor) {
      console.log('❌ Donor profile for lili not found');
      await mongoose.connection.close();
      return;
    }

    // Find patient user to create request
    const patientUser = await User.findOne({ email: 'patient@demo.com' });
    const adminUser = await User.findOne({ email: 'admin@demo.com' });

    // Create a new request that matches lili (e.g. A+ or A- in Karachi)
    const request = await BloodRequest.create({
      patientName: 'A+ Emergency Case',
      bloodGroup: 'A+',
      unitsRequired: 2,
      hospital: 'Aga Khan Hospital',
      city: 'Karachi',
      urgency: 'critical',
      status: 'matching',
      createdBy: patientUser._id,
      verifiedBy: adminUser._id,
    });

    console.log('📋 Created matching request:', request._id);

    // Run matching engine for this request
    const compatibleGroups = getCompatibleGroups(request.bloodGroup);
    const eligibleDonors = await Donor.find({
      bloodGroup: { $in: compatibleGroups },
      city: { $regex: new RegExp(`^${request.city}$`, 'i') },
      isAvailable: true,
    });

    const matchesData = eligibleDonors.map(d => ({
      requestId: request._id,
      donorId: d._id,
      status: 'contacted',
    }));

    if (matchesData.length > 0) {
      const inserted = await DonorMatch.insertMany(matchesData);
      console.log(`🔗 Created ${inserted.length} match records, including one for donor: ${donorUser.name}`);
    } else {
      console.log('⚠ No eligible donors found');
    }

    await mongoose.connection.close();
    console.log('✅ Done');
  } catch (err) {
    console.error(err);
  }
};

run();
