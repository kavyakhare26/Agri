const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Consultation = require('../models/Consultation');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// ─── GET /api/consultations/all ── admin + expert: all consultations ─────────
// Must be defined BEFORE /:id to avoid clash
router.get('/all', authorize('admin', 'expert'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .populate('farmer', 'name email state')
        .populate('replies.author', 'name role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Consultation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: consultations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: consultations,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/consultations ── farmer's own consultations ────────────────────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { farmer: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .populate('replies.author', 'name role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Consultation.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: consultations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: consultations,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/consultations ── farmer creates ───────────────────────────────
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('category')
      .optional()
      .isIn(['soil', 'crop', 'pest', 'weather', 'market', 'equipment', 'other']),
    body('tags').optional().isArray(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const consultation = await Consultation.create({
        ...req.body,
        farmer: req.user._id,
      });
      res.status(201).json({ success: true, data: consultation });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/consultations/:id ───────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('farmer', 'name email state')
      .populate('replies.author', 'name role');

    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    // Farmer can only see own; experts/admins can see all
    const isOwner = consultation.farmer._id.toString() === req.user._id.toString();
    if (!isOwner && !['admin', 'expert'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: consultation });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/consultations/:id/replies ── any authenticated user ───────────
router.post(
  '/:id/replies',
  [body('content').trim().notEmpty().withMessage('Reply content is required')],
  validate,
  async (req, res, next) => {
    try {
      const consultation = await Consultation.findById(req.params.id);
      if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

      if (consultation.status === 'closed') {
        return res.status(400).json({ success: false, message: 'Consultation is closed' });
      }

      const reply = {
        author: req.user._id,
        content: req.body.content,
        isExpert: ['expert', 'admin'].includes(req.user.role),
      };

      consultation.replies.push(reply);

      // Auto-update status when expert/admin replies
      if (reply.isExpert && consultation.status === 'open') {
        consultation.status = 'answered';
      }

      await consultation.save();
      await consultation.populate('replies.author', 'name role');

      res.status(201).json({ success: true, data: consultation });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/consultations/:id ── farmer own or admin ────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    const isOwner = consultation.farmer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await consultation.deleteOne();
    res.json({ success: true, message: 'Consultation deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
