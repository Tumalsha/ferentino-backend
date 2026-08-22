const express = require('express');
const router = express.Router();
const Tyre = require('../models/Tyre');

// GET /api/tyres - get all tyres (optionally filter by category)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const tyres = await Tyre.find(filter);
    res.json(tyres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;