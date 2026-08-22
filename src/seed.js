const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const AdminUser = require('./models/AdminUser');
const RateConfig = require('./models/RateConfig');

// Same defaults as the frontend's landingPriceDefaults.js — kept in sync manually
// since this only runs once per environment, not on every request.
const DEFAULT_RATE_CONFIG = {
  FTC: {
    calcMode: 'two_stage',
    focRatio: null,
    steps: [
      { key: 'distributor', label: 'Distributor', rate: 0.07 },
      { key: 'qty', label: 'Qty', rate: 0.18 },
      { key: 'cash', label: 'Cash', rate: 0.05 },
      { key: 'deposits', label: 'Deposits', rate: 0 },
      { key: 'special', label: 'Special', rate: 0.04 },
    ],
  },
  CEAT: {
    calcMode: 'flat',
    focRatio: 10,
    steps: [
      { key: 'distributor', label: 'Distributor', rate: 0.05 },
      { key: 'qty', label: 'Qty', rate: 0.165 },
      { key: 'cash', label: 'Cash', rate: 0.05 },
      { key: 'sds', label: 'SDS', rate: 0.03 },
    ],
  },
  DSI: {
    calcMode: 'flat',
    focRatio: 10,
    steps: [
      { key: 'distributor', label: 'Distributor', rate: 0.05 },
      { key: 'qty', label: 'Qty', rate: 0.17 },
      { key: 'cash', label: 'Cash', rate: 0.06 },
      { key: 'qtr', label: 'QTR', rate: 0.03 },
    ],
  },
  MRF: {
    calcMode: 'flat',
    focRatio: 10,
    steps: [
      { key: 'qty', label: 'Qty', rate: 0.25 },
      { key: 'cash', label: 'Cash', rate: 0.05 },
      { key: 'line', label: 'Line', rate: 0.05 },
    ],
  },
};

const CATEGORY_IDS = [
  'passenger-car-radial',
  'eternopresa',
  'celestra',
  'lcv',
  'truck-light-truck',
  'two-three-wheeler',
];

async function seed() {
  await connectDB();

  const username = process.env.SEED_ADMIN_USERNAME;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (username && password) {
    const existing = await AdminUser.findOne({ username });
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 10);
      await AdminUser.create({ username, passwordHash });
      console.log(`Created admin user "${username}"`);
    } else {
      console.log(`Admin user "${username}" already exists — left untouched`);
    }
  } else {
    console.log('SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD not set in .env — skipped admin user creation');
  }

  let created = 0;
  for (const categoryId of CATEGORY_IDS) {
    for (const [brand, config] of Object.entries(DEFAULT_RATE_CONFIG)) {
      const existing = await RateConfig.findOne({ categoryId, brand });
      if (!existing) {
        await RateConfig.create({ categoryId, brand, ...config });
        created++;
      }
    }
  }
  console.log(`Seeded ${created} new rate configs (existing ones left untouched)`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
