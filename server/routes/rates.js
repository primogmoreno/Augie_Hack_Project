const express = require('express');
const router = express.Router();
const { getCachedRates } = require('../services/ncuaService');

router.get('/ncua', (req, res) => {
  const rates = getCachedRates();
  if (!rates) return res.status(503).json({ error: 'Rate data not yet available' });
  res.json(rates);
});

module.exports = router;
