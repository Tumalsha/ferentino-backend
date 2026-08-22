const mongoose = require('mongoose');

const dealerPriceSchema = new mongoose.Schema(
  {
    rowKey: { type: String, required: true, unique: true, index: true },
    ftcExVat: { type: Number, default: null },
    CEAT: { type: Number, default: null },
    DSI: { type: Number, default: null },
    MRF: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DealerPrice', dealerPriceSchema);
