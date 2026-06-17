import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import BloodRequest from './models/BloodRequest.js';

import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import requestRoutes from './routes/requests.js';
import matchRoutes from './routes/match.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Blood Donation API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// ── Auto-expiry background job (runs every 30 minutes) ────────────────────────
const startExpiryJob = () => {
  const runExpiry = async () => {
    try {
      const result = await BloodRequest.updateMany(
        {
          status: { $nin: ['fulfilled', 'expired', 'cancelled'] },
          expiresAt: { $lt: new Date() },
        },
        { $set: { status: 'expired' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`⏰ Auto-expired ${result.modifiedCount} request(s)`);
      }
    } catch (err) {
      console.error('Auto-expiry job error:', err.message);
    }
  };

  // Run once immediately on startup, then every 30 minutes
  runExpiry();
  setInterval(runExpiry, 30 * 60 * 1000);
  console.log('⏰ Auto-expiry job started (runs every 30 min)');
};

// Connect to Database & Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  });
  startExpiryJob();
});

export default app;
