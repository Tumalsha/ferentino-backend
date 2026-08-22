const express = require('express');
const PriceOverride = require('../models/PriceOverride');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const ALLOWED_FIELDS = ['exVat', 'incVat', 'discount', 'FTC', 'CEAT', 'DSI', 'MRF'];

// Public — the View page needs this with no login.
router.get('/', async (req, res) => {
  const overrides = await PriceOverride.find({});
  res.json(overrides);
});

// Admin only — upsert a single field on a single row.
router.put('/:rowKey', requireAuth, async (req, res) => {
  const { rowKey } = req.params;
  const { field, value, categoryId, size, pattern } = req.body;

  if (!ALLOWED_FIELDS.includes(field)) {
    return res.status(400).json({ error: `field must be one of ${ALLOWED_FIELDS.join(', ')}` });
  }
  if (!categoryId || !size || !pattern) {
    return res.status(400).json({ error: 'categoryId, size, and pattern are required (used on first write to this row)' });
  }

  const doc = await PriceOverride.findOneAndUpdate(
    { rowKey },
    { $set: { [field]: value, categoryId, size, pattern, rowKey } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json(doc);
});

module.exports = router;
