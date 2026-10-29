const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// Helper — verify that the farmer owns the given farmId
const ownershipCheck = async (farmId, userId, role) => {
  const farm = await Farm.findById(farmId);
  if (!farm) return { error: 'Farm not found', status: 404 };
  if (farm.owner.toString() !== userId.toString() && role !== 'admin') {
    return { error: 'Not authorized for this farm', status: 403 };
  }
  return { farm };
};

// ─── GET /api/crops ───────────────────────────────────────────────────────────
// Returns crops belonging to the authenticated farmer
// Optional: ?farmId=xxx to filter by farm, ?status=active, ?page, ?limit
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { owner: req.user._id };
    if (req.query.farmId) filter.farm = req.query.farmId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.growthStage) filter.growthStage = req.query.growthStage;

    const [crops, total] = await Promise.all([
      Crop.find(filter)
        .populate('farm', 'name location')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Crop.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: crops.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: crops,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/crops ──────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('farm').notEmpty().withMessage('Farm ID is required'),
    body('name').trim().notEmpty().withMessage('Crop name is required'),
    body('growthStage')
      .optional()
      .isIn(['seed', 'germination', 'vegetative', 'flowering', 'fruiting', 'ripening', 'harvested']),
    body('status').optional().isIn(['active', 'completed', 'failed']),
    body('areaHectares').optional().isFloat({ min: 0.01 }),
    body('plantingDate').optional().isISO8601(),
    body('expectedHarvestDate').optional().isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { farm: farmId } = req.body;
      const check = await ownershipCheck(farmId, req.user._id, req.user.role);
      if (check.error) return res.status(check.status).json({ success: false, message: check.error });

      const crop = await Crop.create({ ...req.body, owner: req.user._id });
      res.status(201).json({ success: true, data: crop });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/crops/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farm', 'name location')
      .populate('activityLog.performedBy', 'name role');
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

    if (crop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: crop });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/crops/:id ───────────────────────────────────────────────────────
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('growthStage')
      .optional()
      .isIn(['seed', 'germination', 'vegetative', 'flowering', 'fruiting', 'ripening', 'harvested']),
    body('status').optional().isIn(['active', 'completed', 'failed']),
    body('areaHectares').optional().isFloat({ min: 0.01 }),
    body('plantingDate').optional().isISO8601(),
    body('expectedHarvestDate').optional().isISO8601(),
    body('actualHarvestDate').optional().isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      let crop = await Crop.findById(req.params.id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (crop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Disallow changing owner/farm via PUT
      delete req.body.owner;
      delete req.body.farm;
      delete req.body.activityLog;

      crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      res.json({ success: true, data: crop });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/crops/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

    if (crop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await crop.deleteOne();
    res.json({ success: true, message: 'Crop deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/crops/:id/activities ── add activity to log ──────────────────
router.post(
  '/:id/activities',
  [
    body('type')
      .isIn(['planting', 'watering', 'fertilizing', 'pest_control', 'harvesting', 'observation', 'other'])
      .withMessage('Invalid activity type'),
    body('note').optional().trim(),
    body('date').optional().isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const crop = await Crop.findById(req.params.id);
      if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });

      if (crop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const activity = {
        type: req.body.type,
        note: req.body.note,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        performedBy: req.user._id,
      };

      crop.activityLog.push(activity);
      await crop.save();

      res.status(201).json({ success: true, data: crop });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
