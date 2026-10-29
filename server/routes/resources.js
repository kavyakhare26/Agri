const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// ─── GET /api/resources ── all approved, paginated, searchable ───────────────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { isApproved: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.minPrice) filter.price = { ...filter.price, $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };

    const [resources, total] = await Promise.all([
      Resource.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Resource.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: resources.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: resources,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/resources/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('addedBy', 'name');
    if (!resource || !resource.isApproved) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/resources ── admin creates approved resource ─────────────────
router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category')
      .isIn(['seed', 'fertilizer', 'pesticide', 'tool', 'equipment', 'other'])
      .withMessage('Invalid category'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative'),
    body('unit').trim().notEmpty().withMessage('Unit is required'),
    body('stock').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const resource = await Resource.create({
        ...req.body,
        isApproved: true,
        addedBy: req.user._id,
      });
      res.status(201).json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/resources/:id ── admin only ────────────────────────────────────
router.put(
  '/:id',
  authorize('admin'),
  [
    body('name').optional().trim().notEmpty(),
    body('category').optional().isIn(['seed', 'fertilizer', 'pesticide', 'tool', 'equipment', 'other']),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
      res.json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/resources/:id ── admin only ─────────────────────────────────
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    await resource.deleteOne();
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
