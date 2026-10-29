const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Resource = require('../models/Resource');
const ForumPost = require('../models/ForumPost');
const PestAlert = require('../models/PestAlert');
const Consultation = require('../models/Consultation');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFarms,
      totalCrops,
      totalOrders,
      totalResources,
      totalForumPosts,
      totalAlerts,
      totalConsultations,
      pendingOrders,
      openConsultations,
    ] = await Promise.all([
      User.countDocuments(),
      Farm.countDocuments(),
      Crop.countDocuments(),
      Order.countDocuments(),
      Resource.countDocuments({ isApproved: true }),
      ForumPost.countDocuments(),
      PestAlert.countDocuments({ isActive: true }),
      Consultation.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Consultation.countDocuments({ status: 'open' }),
    ]);

    // Revenue from delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        users: totalUsers,
        farms: totalFarms,
        crops: totalCrops,
        orders: totalOrders,
        resources: totalResources,
        forumPosts: totalForumPosts,
        pestAlerts: totalAlerts,
        consultations: totalConsultations,
        pendingOrders,
        openConsultations,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/users ── list users paginated + searchable ───────────────
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/users/:id ── update user role/isActive ──────────────────
router.put(
  '/users/:id',
  [
    body('role').optional().isIn(['farmer', 'expert', 'admin']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean(),
    body('name').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowedFields = ['role', 'isActive', 'name', 'phone', 'state'];
      const updates = {};
      allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/orders ── all orders ─────────────────────────────────────
router.get('/orders', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('farmer', 'name email phone')
        .populate('items.resource', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/resources/:id/approve ── approve a resource ─────────────
router.put('/resources/:id/approve', async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/pest-alerts ── all pest alerts ───────────────────────────
router.get('/pest-alerts', async (req, res, next) => {
  try {
    const alerts = await PestAlert.find({})
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/consultations ── all consultations ───────────────────────
router.get('/consultations', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .populate('farmer', 'name email')
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

module.exports = router;
