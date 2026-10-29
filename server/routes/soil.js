const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Farm = require('../models/Farm');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

/**
 * Rule-based soil recommendations
 */
const getRecommendations = ({ pH, N, P, K, moisture }) => {
  const recs = [];
  if (pH !== undefined && pH < 6) recs.push('Apply lime to raise soil pH above 6.0');
  if (pH !== undefined && pH > 7.5) recs.push('Apply sulfur to lower soil pH below 7.5');
  if (N !== undefined && N < 50) recs.push('Apply nitrogen fertilizer — current N level is low');
  if (P !== undefined && P < 25) recs.push('Apply phosphorus fertilizer — current P level is low');
  if (K !== undefined && K < 150) recs.push('Apply potassium fertilizer — current K level is low');
  if (moisture !== undefined && moisture < 20) recs.push('Irrigate soon — soil moisture is critically low');
  if (moisture !== undefined && moisture > 80) recs.push('Reduce irrigation — soil moisture is excessive');
  if (recs.length === 0) recs.push('Soil readings are within healthy ranges. Maintain current practices.');
  return recs;
};

// ─── POST /api/soil/:farmId ── add a soil reading ────────────────────────────
router.post(
  '/:farmId',
  [
    body('pH').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
    body('N').optional().isFloat({ min: 0 }).withMessage('N must be non-negative'),
    body('P').optional().isFloat({ min: 0 }).withMessage('P must be non-negative'),
    body('K').optional().isFloat({ min: 0 }).withMessage('K must be non-negative'),
    body('moisture').optional().isFloat({ min: 0, max: 100 }).withMessage('Moisture must be 0–100'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const farm = await Farm.findById(req.params.farmId);
      if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

      if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized for this farm' });
      }

      const { pH, N, P, K, moisture } = req.body;
      const reading = { pH, N, P, K, moisture, recordedAt: new Date() };

      farm.soilReadings.push(reading);
      await farm.save();

      const recommendations = getRecommendations({ pH, N, P, K, moisture });

      res.status(201).json({
        success: true,
        data: reading,
        recommendations,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/soil/:farmId ── get all soil readings + recommendations ─────────
router.get('/:farmId', async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.farmId);
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this farm' });
    }

    // Sort newest first
    const readings = [...farm.soilReadings].sort(
      (a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)
    );

    // Compute recommendations from latest reading
    let recommendations = [];
    if (readings.length > 0) {
      recommendations = getRecommendations(readings[0]);
    }

    res.json({
      success: true,
      farmId: farm._id,
      farmName: farm.name,
      count: readings.length,
      data: readings,
      latestRecommendations: recommendations,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
