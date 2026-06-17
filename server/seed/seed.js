import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

// Models
import User from '../models/User.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import DonorMatch from '../models/DonorMatch.js';
import DonationHistory from '../models/DonationHistory.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clean existing data
  await Promise.all([
    User.deleteMany(),
    Donor.deleteMany(),
    BloodRequest.deleteMany(),
    DonorMatch.deleteMany(),
    DonationHistory.deleteMany(),
  ]);
  console.log('🗑️  Cleared existing data');

  const now = new Date();
  const daysAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta'];
  const areas = ['DHA', 'Gulshan', 'Clifton', 'Bahria', 'Saddar'];
  const urgencies = ['critical', 'urgent', 'normal'];
  const hospitals = ['Aga Khan Hospital', 'National Hospital', 'City Hospital', 'General Hospital', 'Medicare'];

  const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // --- Create Users ---
  const usersData = [
    { name: 'System Admin', email: 'admin@demo.com', password: 'Admin1234', role: 'admin' },
    { name: 'Demo Donor', email: 'donor@demo.com', password: 'Donor1234', role: 'donor' },
    { name: 'Demo Patient', email: 'patient@demo.com', password: 'Patient1234', role: 'patient' },
  ];

  // Generate 19 more Donors
  for (let i = 1; i <= 19; i++) {
    usersData.push({
      name: `Donor User ${i}`,
      email: `donor${i}@demo.com`,
      password: 'Demo1234',
      role: 'donor'
    });
  }

  // Generate 19 more Patients
  for (let i = 1; i <= 19; i++) {
    usersData.push({
      name: `Patient User ${i}`,
      email: `patient${i}@demo.com`,
      password: 'Demo1234',
      role: 'patient'
    });
  }

  // Hash passwords before creating
  const hashedUsers = await Promise.all(
    usersData.map(async (u) => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    }))
  );
  const users = await User.insertMany(hashedUsers);
  console.log(`👥 Created ${users.length} users (1 Admin, 20 Donors, 20 Patients)`);

  const adminUser = users.find(u => u.role === 'admin');

  // --- Create Donor Profiles ---
  const donorUsers = users.filter(u => u.role === 'donor');
  const donorsData = donorUsers.map((u, i) => {
    // Demo Donor specifically configured to be O+ and available
    if (u.email === 'donor@demo.com') {
      return {
        userId: u._id, bloodGroup: 'O+', city: 'Karachi', area: 'DHA',
        phone: '0300-1111111', lastDonationDate: daysAgo(90), isAvailable: true, totalDonations: 5, consentGiven: true
      };
    }
    
    // Randomize the rest
    return {
      userId: u._id,
      bloodGroup: randomEl(bloodGroups),
      city: randomEl(cities),
      area: randomEl(areas),
      phone: `030${Math.floor(Math.random() * 9000000) + 1000000}`,
      lastDonationDate: Math.random() > 0.5 ? daysAgo(Math.floor(Math.random() * 100)) : null,
      isAvailable: Math.random() > 0.2, // 80% chance of being available
      totalDonations: Math.floor(Math.random() * 10),
      consentGiven: Math.random() > 0.1 // 90% chance of consent
    };
  });

  const donorRecords = await Donor.insertMany(donorsData);
  console.log(`🩸 Created ${donorRecords.length} donor profiles`);

  // --- Create Blood Requests ---
  const patientUsers = users.filter(u => u.role === 'patient');
  const requestsData = [];

  patientUsers.forEach((u, i) => {
    // Demo Patient specifically has a critical O+ request
    if (u.email === 'patient@demo.com') {
      requestsData.push({
        patientName: 'Emergency Patient',
        bloodGroup: 'O+',
        unitsRequired: 3,
        hospital: 'Aga Khan Hospital',
        city: 'Karachi',
        urgency: 'critical',
        status: 'matching', // ready for matching
        createdBy: u._id,
        verifiedBy: adminUser._id, // Verified by admin
        createdAt: daysAgo(1),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        additionalNotes: 'Emergency surgery required. Please respond ASAP.',
      });
    }

    // Give each patient 1 or 2 requests
    const numReqs = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numReqs; j++) {
      const statusOptions = ['pending', 'verified', 'matching', 'fulfilled', 'cancelled', 'expired'];
      const status = randomEl(statusOptions);
      
      requestsData.push({
        patientName: `${u.name}'s Relative`,
        bloodGroup: randomEl(bloodGroups),
        unitsRequired: Math.floor(Math.random() * 4) + 1,
        hospital: randomEl(hospitals),
        city: randomEl(cities),
        urgency: randomEl(urgencies),
        status: status,
        createdBy: u._id,
        verifiedBy: ['verified', 'matching', 'fulfilled'].includes(status) ? adminUser._id : null,
        createdAt: daysAgo(Math.floor(Math.random() * 30)),
        expiresAt: status === 'pending' || status === 'verified' || status === 'matching' 
          ? new Date(Date.now() + 72 * 60 * 60 * 1000) 
          : daysAgo(Math.floor(Math.random() * 5)),
      });
    }
  });

  const requests = await BloodRequest.insertMany(requestsData);
  console.log(`📋 Created ${requests.length} blood requests`);

  // --- Create Donor Matches ---
  // Just create some mock matches for the Demo Patient's request to populate the dashboard
  const activeRequest = requests.find(r => r.patientName === 'Emergency Patient');
  if (activeRequest) {
    const oPosDonors = donorRecords.filter(d => ['O+', 'O-'].includes(d.bloodGroup) && d.isAvailable).slice(0, 3);
    
    const matchesData = oPosDonors.map((donor, idx) => ({
      requestId: activeRequest._id,
      donorId: donor._id,
      status: idx === 0 ? 'committed' : idx === 1 ? 'contacted' : 'declined',
      contactRevealedAt: idx === 0 ? new Date() : null,
      respondedAt: idx !== 1 ? new Date() : null,
    }));

    if (matchesData.length > 0) {
      const matches = await DonorMatch.insertMany(matchesData);
      console.log(`🔗 Created ${matches.length} mock donor matches`);
    }
  }

  // --- Create Donation History ---
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled');
  const historyData = [];

  for (let i = 0; i < Math.min(10, fulfilledRequests.length); i++) {
    const req = fulfilledRequests[i];
    const donor = randomEl(donorRecords);
    
    historyData.push({
      donorId: donor._id,
      requestId: req._id,
      units: req.unitsRequired,
      hospitalName: req.hospital,
      donatedAt: req.createdAt, // Just mock it to request creation time
    });
  }

  if (historyData.length > 0) {
    await DonationHistory.insertMany(historyData);
    console.log(`📜 Created ${historyData.length} donation history records`);
  }

  console.log('\n✅ Seeding complete!\n');
  console.log('═══════════════════════════════════════');
  console.log('Demo Credentials:');
  console.log('  Admin:    admin@demo.com    / Admin1234');
  console.log('  Donor:    donor@demo.com    / Donor1234');
  console.log('  Patient:  patient@demo.com  / Patient1234');
  console.log('═══════════════════════════════════════\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
