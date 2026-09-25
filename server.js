const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// ── Global rate limiter (200 req / 15 min per IP) ─────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});
app.use(globalLimiter);

// ── Stricter limiter for auth endpoints ───────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' }
});
app.use('/vendors/login', authLimiter);
app.use('/vendors/register', authLimiter);
app.use('/receivers/login', authLimiter);
app.use('/receivers/register', authLimiter);
app.use('/admin/admin/login', authLimiter);

// ── DB connection ─────────────────────────────────────────────
require('./db');

// ── Routes ────────────────────────────────────────────────────
const vendorRoute = require('./routes/vendorsRoute');
const receiverRoute = require('./routes/ReceiversRoute');
const adminRoute = require('./routes/adminRoute');

app.use('/vendors', vendorRoute);
app.use('/receivers', receiverRoute);
app.use('/admin', adminRoute);

// ── Cron: expire donations every 5 minutes ───────────────────
const Donation = require('./model/Donation');
cron.schedule('*/5 * * * *', async () => {
  try {
    const result = await Donation.updateMany(
      { status: 'available', expiryTime: { $lte: new Date() } },
      { $set: { status: 'expired' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[cron] Expired ${result.modifiedCount} donation(s).`);
    }
  } catch (err) {
    console.error('[cron] Error expiring donations:', err.message);
  }
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.'
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});