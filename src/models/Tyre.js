const mongoose = require('mongoose');

const tyreSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  groupLabel: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Passenger Car Radial',
  },
  size: {
    type: String,
    required: true,
  },
  pattern: {
    type: String,
    required: true,
  },
  exVat: {
    type: Number,
    required: true,
  },
  incVat: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Tyre', tyreSchema);