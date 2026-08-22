const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    rate: { type: Number, required: true },
  },
  { _id: false }
);

const rateConfigSchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true },
    brand: { type: String, required: true },
    calcMode: { type: String, enum: ['two_stage', 'flat'], required: true },
    focRatio: { type: Number, default: null },
    steps: { type: [stepSchema], default: [] },
  },
  { timestamps: true }
);

// One config per category+brand combination.
rateConfigSchema.index({ categoryId: 1, brand: 1 }, { unique: true });

module.exports = mongoose.model('RateConfig', rateConfigSchema);
