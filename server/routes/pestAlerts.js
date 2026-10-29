const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const PestAlert = require('../models/PestAlert');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// ─── GET /api/pest-alerts ── all active alerts, paginated ────────────────────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.region) filter.region = { $regex: req.query.region, $options: 'i' };

    const [alerts, total] = await Promise.all([
      PestAlert.find(filter)
        .populate('postedBy', 'name role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      PestAlert.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: alerts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: alerts,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/pest-alerts/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const alert = await PestAlert.findById(req.params.id).populate('postedBy', 'name role');
    if (!alert) return res.status(404).json({ success: false, message: 'Pest alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/pest-alerts ── admin only ────────────────────────────────────
router.post(
  '/',
  authorize('admin', 'expert'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
    body('type')
      .optional()
      .isIn(['fungal', 'bacterial', 'insect', 'weed', 'drought', 'flood', 'general']),
    body('affectedCrops').optional().isArray(),
    body('region').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const alert = await PestAlert.create({ ...req.body, postedBy: req.user._id });
      res.status(201).json({ success: true, data: alert });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/pest-alerts/:id ── admin only ──────────────────────────────────
router.put(
  '/:id',
  authorize('admin', 'expert'),
  [
    body('title').optional().trim().notEmpty(),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('type')
      .optional()
      .isIn(['fungal', 'bacterial', 'insect', 'weed', 'drought', 'flood', 'general']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const alert = await PestAlert.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!alert) return res.status(404).json({ success: false, message: 'Pest alert not found' });
      res.json({ success: true, data: alert });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/pest-alerts/:id ── admin only ──────────────────────────────
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const alert = await PestAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Pest alert not found' });
    await alert.deleteOne();
    res.json({ success: true, message: 'Pest alert deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
