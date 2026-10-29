const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Farm = require('../models/Farm');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All farm routes require authentication
router.use(protect);

// ─── GET /api/farms ── list farmer's own farms (paginated, searchable) ───────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { owner: req.user._id };
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const [farms, total] = await Promise.all([
      Farm.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Farm.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: farms.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: farms,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/farms ─────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Farm name is required'),
    body('areaHectares').isFloat({ min: 0.01 }).withMessage('Area must be a positive number'),
    body('soilType').optional().isIn(['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other']),
    body('irrigationType').optional().isIn(['drip', 'sprinkler', 'flood', 'rainfed', 'other']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const farm = await Farm.create({ ...req.body, owner: req.user._id });
      res.status(201).json({ success: true, data: farm });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/farms/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id).populate('owner', 'name email');
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    // Only owner or admin can view
    if (farm.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this farm' });
    }

    res.json({ success: true, data: farm });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/farms/:id ───────────────────────────────────────────────────────
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Farm name cannot be empty'),
    body('areaHectares').optional().isFloat({ min: 0.01 }).withMessage('Area must be positive'),
    body('soilType').optional().isIn(['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other']),
    body('irrigationType').optional().isIn(['drip', 'sprinkler', 'flood', 'rainfed', 'other']),
  ],
  validate,
  async (req, res, next) => {
    try {
      let farm = await Farm.findById(req.params.id);
      if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

      if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update this farm' });
      }

      // Do not allow owner field to be changed
      delete req.body.owner;

      farm = await Farm.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      res.json({ success: true, data: farm });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/farms/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });

    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this farm' });
    }

    await farm.deleteOne();
    res.json({ success: true, message: 'Farm deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
