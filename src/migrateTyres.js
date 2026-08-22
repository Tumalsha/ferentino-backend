const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./db');
const Tyre = require('./models/Tyre');

async function migrate() {
  await connectDB();

  const dataFolder = path.join(__dirname, 'tyreData');
  const files = fs.readdirSync(dataFolder).filter(f => f.endsWith('.json'));

  let totalInserted = 0;

  for (const file of files) {
    const filePath = path.join(dataFolder, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const category = data.label;
    const tyresToInsert = [];

    for (const group of data.groups) {
      for (const item of group.items) {
        tyresToInsert.push({
          brand: group.groupLabel,
          groupLabel: group.groupLabel,
          category: category,
          size: item.size,
          pattern: item.pattern,
          exVat: item.exVat,
          incVat: item.incVat,
        });
      }
    }

    if (tyresToInsert.length > 0) {
      await Tyre.insertMany(tyresToInsert);
      console.log(`Inserted ${tyresToInsert.length} tyres from ${file}`);
      totalInserted += tyresToInsert.length;
    }
  }

  console.log(`\nMigration complete. Total tyres inserted: ${totalInserted}`);
  await mongoose.connection.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});