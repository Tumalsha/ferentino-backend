const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set — copy .env.example to .env and fill it in.');
  }

  await mongoose.connect(uri);
  isConnected = true;
  console.log('MongoDB connected');
}

module.exports = connectDB;