const express = require('express');
const DealerPrice = require('../models/DealerPrice');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const ALLOWED_FIELDS = ['ftcExVat', 'CEAT', 'DSI', 'MRF'];

// Admin only, both directions — this is internal distributor cost data,
// never shown on the public View page.
router.get('/', requireAuth, async (req, res) => {
  const prices = await DealerPrice.find({});
  res.json(prices);
});

router.put('/:rowKey', requireAuth, async (req, res) => {
  const { rowKey } = req.params;
  const { field, value } = req.body;

  if (!ALLOWED_FIELDS.includes(field)) {
    return res.status(400).json({ error: `field must be one of ${ALLOWED_FIELDS.join(', ')}` });
  }

  const doc = await DealerPrice.findOneAndUpdate(
    { rowKey },
    { $set: { [field]: value } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json(doc);
});

module.exports = router;
