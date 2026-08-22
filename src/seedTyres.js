const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
// src/seedTyres.js
//
// Imports all tyre JSON files from src/tyreData/ into the MongoDB "Tyre" collection.
// Run with: node src/seedTyres.js  (or add "seed:tyres": "node src/seedTyres.js" to package.json scripts)
//
// Each JSON file looks like:
//   { label, description, groups: [ { groupLabel, items: [ {size, pattern, exVat, incVat} ] } ] }
//
// Mapping used:
//   - brand       = the group's groupLabel (e.g. "ETERNOPRESA") — confirmed for eternopresa.json
//   - groupLabel  = same as brand, kept as its own field per the schema
//   - category    = fixed per file, based on the FILE_CATEGORY_MAP below
//
// ⚠️ CHECK THIS MAP — I've only seen the contents of eternopresa.json. If any of
// these category guesses are wrong for celestra/lcv/truckLightTruck/twoThreeWheeler/
// passengerCarRadial, just edit the values below before running.
const FILE_CATEGORY_MAP = {
  'eternopresa.json': 'Passenger Car Radial',
  'celestra.json': 'Passenger Car Radial',
  'lcv.json': 'LCV',
  'truckLightTruck.json': 'Truck / Light Truck',
  'twoThreeWheeler.json': 'Two/Three Wheeler',
  'passengerCarRadial.json': 'Passenger Car Radial',
};

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');
const Tyre = require('./models/Tyre');

const TYRE_DATA_DIR = path.join(__dirname, 'tyreData');

async function seedTyres() {
  await connectDB();

  const files = fs.readdirSync(TYRE_DATA_DIR).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON file(s) in tyreData/:`, files);

  let upserted = 0;
  let skipped = 0;

  for (const file of files) {
    const category = FILE_CATEGORY_MAP[file];
    if (!category) {
      console.warn(`⚠️  No category mapping for "${file}" — skipping this file. Add it to FILE_CATEGORY_MAP.`);
      skipped++;
      continue;
    }

    const filePath = path.join(TYRE_DATA_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!Array.isArray(data.groups)) {
      console.warn(`⚠️  "${file}" has no "groups" array — skipping.`);
      skipped++;
      continue;
    }

    const ops = [];
    for (const group of data.groups) {
      const brand = group.groupLabel;
      for (const item of group.items || []) {
        ops.push({
          updateOne: {
            filter: { brand, size: item.size, pattern: item.pattern },
            update: {
              $set: {
                brand,
                groupLabel: group.groupLabel,
                category,
                size: item.size,
                pattern: item.pattern,
                exVat: item.exVat,
                incVat: item.incVat,
              },
            },
            upsert: true,
          },
        });
      }
    }

    if (ops.length === 0) {
      console.log(`No items found in "${file}" — nothing to import.`);
      continue;
    }

    const result = await Tyre.bulkWrite(ops);
    const fileUpserted = (result.upsertedCount || 0) + (result.modifiedCount || 0);
    upserted += fileUpserted;
    console.log(`✅ ${file}: imported/updated ${fileUpserted} tyre(s) under category "${category}"`);
  }

  console.log(`\nDone. Total tyres upserted: ${upserted}. Files skipped: ${skipped}.`);
  process.exit(0);
}

seedTyres().catch((err) => {
  console.error('Tyre seed failed:', err.message);
  process.exit(1);
});
