import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';
import Donor from '../models/Donor.js';
import DonorMatch from '../models/DonorMatch.js';
import BloodRequest from '../models/BloodRequest.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find();
    const donors = await Donor.find().populate('userId');
    const matches = await DonorMatch.find().populate('donorId').populate('requestId');

    console.log('\n=== USERS ===');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`);
    });

    console.log('\n=== DONORS ===');
    donors.forEach(d => {
      console.log(`- Name: ${d.userId?.name} (${d.userId?.email})`);
      console.log(`  Group: ${d.bloodGroup}, City: ${d.city}, Available: ${d.isAvailable}`);
    });

    console.log('\n=== MATCHES ===');
    matches.forEach(m => {
      console.log(`- Donor: ${m.donorId?.userId?.name || m.donorId?.userId || 'NULL'} | Request: ${m.requestId?.patientName || 'NULL'} | Status: ${m.status}`);
    });

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

run();
