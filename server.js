const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/db');

const authRoutes = require('./src/routes/auth.routes');
const priceOverrideRoutes = require('./src/routes/priceOverrides.routes');
const dealerPriceRoutes = require('./src/routes/dealerPrices.routes');
const rateConfigRoutes = require('./src/routes/rateConfigs.routes');
const tyreRoutes = require('./src/routes/tyres.routes');

const app = express();
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/price-overrides', priceOverrideRoutes);
app.use('/api/dealer-prices', dealerPriceRoutes);
app.use('/api/rate-configs', rateConfigRoutes);
app.use('/api/tyres', tyreRoutes);

// Centralized error handler — catches anything thrown/rejected in a route
// that wasn't already handled with its own try/catch.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
