const mongoose = require('mongoose');

// rowKey mirrors the frontend's own row identity: "<categoryId>|<size>|<pattern>"
const priceOverrideSchema = new mongoose.Schema(
  {
    rowKey: { type: String, required: true, unique: true, index: true },
    categoryId: { type: String, required: true },
    size: { type: String, required: true },
    pattern: { type: String, required: true },
    exVat: { type: Number, default: null },
    incVat: { type: Number, default: null },
    discount: { type: String, default: null },
    FTC: { type: Number, default: null },
    CEAT: { type: Number, default: null },
    DSI: { type: Number, default: null },
    MRF: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PriceOverride', priceOverrideSchema);
