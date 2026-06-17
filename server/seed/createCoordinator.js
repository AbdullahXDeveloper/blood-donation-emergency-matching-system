import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';

const createCoordinator = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'coordinator@lifelink.com';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('⚠ Coordinator user already exists:', email);
      await mongoose.connection.close();
      return;
    }

    const coordinator = await User.create({
      name: 'Demo Coordinator',
      email,
      password: 'CoordinatorSecure123!',
      role: 'coordinator',
      hospitalAffiliation: 'Aga Khan Hospital',
      isApproved: true,
    });

    console.log('🚀 Coordinator created successfully!');
    console.log('Email:', coordinator.email);
    console.log('Password: CoordinatorSecure123!');
    console.log('Affiliated Hospital:', coordinator.hospitalAffiliation);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Failed to create coordinator:', error);
  }
};

createCoordinator();
