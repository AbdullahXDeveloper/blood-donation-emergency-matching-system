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

    // 1. Wipe all existing matches
    await DonorMatch.deleteMany({});
    console.log('🗑️  Wiped existing matches');

    // 2. Fetch all donors and patients
    const donors = await Donor.find().populate('userId');
    const patientUser = await User.findOne({ role: 'patient' });
    const adminUser = await User.findOne({ role: 'admin' });

    console.log(`Found ${donors.length} donors in the system`);

    // 3. For each donor, ensure there is an active matching request in their city
    for (let donor of donors) {
      if (!donor.userId) continue;

      // Find compatible patient blood groups for this donor's blood group
      // Donor can donate to patientGroup if donor.bloodGroup is in compatibility[patientGroup]
      // Let's create a request with the exact same blood group as the donor (always compatible)
      const patientGroup = donor.bloodGroup;

      const request = await BloodRequest.create({
        patientName: `Patient for ${donor.userId.name}`,
        bloodGroup: patientGroup,
        unitsRequired: Math.floor(Math.random() * 3) + 1,
        hospital: 'Aga Khan Hospital',
        city: donor.city,
        urgency: 'critical',
        status: 'matching',
        createdBy: patientUser._id,
        verifiedBy: adminUser._id,
      });

      console.log(`📋 Created request for donor ${donor.userId.name} (${donor.bloodGroup} in ${donor.city})`);

      // Run matching for this request
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
        await DonorMatch.insertMany(matchesData);
      }
    }

    console.log('🔗 Matching completed for all donors.');

    const totalMatches = await DonorMatch.countDocuments();
    console.log(`Total active matches in system: ${totalMatches}`);

    await mongoose.connection.close();
    console.log('✅ Done');
  } catch (err) {
    console.error(err);
  }
};

run();
