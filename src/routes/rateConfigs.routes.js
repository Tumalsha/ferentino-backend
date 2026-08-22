const express = require('express');
const RateConfig = require('../models/RateConfig');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const configs = await RateConfig.find({});
  res.json(configs);
});

// Three ways to call this, matching the three edits the Admin UI makes:
// 1. { stepKey, rate }     — edit one discount step
// 2. { focRatio }          — edit the FOC ratio
// 3. { calcMode, focRatio, steps } — full upsert (used by the seed script)
router.put('/:categoryId/:brand', requireAuth, async (req, res) => {
  const { categoryId, brand } = req.params;
  const { stepKey, rate, focRatio, calcMode, steps } = req.body;

  if (stepKey !== undefined && rate !== undefined) {
    const existing = await RateConfig.findOne({ categoryId, brand });
    if (!existing) {
      return res.status(404).json({ error: 'No rate config exists yet for this category/brand — run the seed script first' });
    }
    existing.steps = existing.steps.map((s) => (s.key === stepKey ? { ...s.toObject(), rate } : s));
    await existing.save();
    return res.json(existing);
  }

  if (focRatio !== undefined && calcMode === undefined) {
    const doc = await RateConfig.findOneAndUpdate({ categoryId, brand }, { $set: { focRatio } }, { new: true, upsert: true });
    return res.json(doc);
  }

  const doc = await RateConfig.findOneAndUpdate(
    { categoryId, brand },
    { $set: { calcMode, focRatio, steps } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(doc);
});

module.exports = router;
