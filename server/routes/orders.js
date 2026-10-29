const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Order = require('../models/Order');
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// ─── POST /api/orders ── farmer creates order ────────────────────────────────
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.resource').notEmpty().withMessage('Each item must reference a resource'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryAddress.name').notEmpty().withMessage('Delivery name is required'),
    body('deliveryAddress.phone').notEmpty().withMessage('Delivery phone is required'),
    body('deliveryAddress.district').notEmpty().withMessage('District is required'),
    body('deliveryAddress.state').notEmpty().withMessage('State is required'),
    body('deliveryAddress.pincode').notEmpty().withMessage('Pincode is required'),
    body('paymentMethod').optional().isIn(['cod', 'online']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { items, deliveryAddress, paymentMethod, notes } = req.body;

      // Validate stock and build order items
      const orderItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const resource = await Resource.findById(item.resource);
        if (!resource || !resource.isApproved) {
          return res.status(404).json({
            success: false,
            message: `Resource ${item.resource} not found or not available`,
          });
        }
        if (resource.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${resource.name}". Available: ${resource.stock}`,
          });
        }
        orderItems.push({
          resource: resource._id,
          name: resource.name,
          price: resource.price,
          quantity: item.quantity,
        });
        totalAmount += resource.price * item.quantity;
      }

      // Create order
      const order = await Order.create({
        farmer: req.user._id,
        items: orderItems,
        totalAmount,
        deliveryAddress,
        paymentMethod: paymentMethod || 'cod',
        notes,
      });

      // Decrement stock
      for (const item of items) {
        await Resource.findByIdAndUpdate(item.resource, {
          $inc: { stock: -item.quantity },
        });
      }

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/orders ── farmer's own orders ──────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { farmer: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.resource', 'name imageUrl')
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

// ─── GET /api/orders/admin/all ── admin: all orders paginated ───────────────
router.get('/admin/all', authorize('admin'), async (req, res, next) => {
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

// ─── GET /api/orders/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmer', 'name email phone')
      .populate('items.resource', 'name imageUrl brand');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only farmer who placed it or admin
    if (order.farmer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/orders/:id/status ── admin updates order status ───────────────
router.put(
  '/:id/status',
  authorize('admin'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      // If cancelling — restore stock
      if (req.body.status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          if (item.resource) {
            await Resource.findByIdAndUpdate(item.resource, {
              $inc: { stock: item.quantity },
            });
          }
        }
      }

      order.status = req.body.status;
      await order.save();

      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
