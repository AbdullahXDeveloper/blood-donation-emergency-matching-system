import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

import User from '../models/User.js';

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'superadmin@lifelink.com';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('⚠ Admin user already exists:', email);
      await mongoose.connection.close();
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Super Admin',
      email,
      password: 'SuperAdminSecure123!',
      role: 'admin',
      isApproved: true,
    });

    console.log('🚀 Super Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: SuperAdminSecure123!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
};

createAdmin();
