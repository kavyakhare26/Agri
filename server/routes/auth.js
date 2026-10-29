const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Helper — generate signed JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ─── POST /api/auth/register ────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['farmer', 'expert', 'admin']).withMessage('Invalid role'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, role, phone, state, preferredLanguage } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({ name, email, password, role, phone, state, preferredLanguage });
      const token = generateToken(user._id);

      res.status(201).json({ success: true, token, user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/login ───────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      // toJSON removes password
      res.json({ success: true, token, user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/auth/me ── update own profile ─────────────────────────────────
router.put(
  '/me',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('preferredLanguage').optional().isIn(['en', 'hi', 'mr']).withMessage('Invalid language'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowedFields = ['name', 'phone', 'state', 'preferredLanguage'];
      const updates = {};
      allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/auth/password ── change own password ──────────────────────────
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select('+password');
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = req.body.newPassword;
      await user.save();
      const token = generateToken(user._id);
      res.json({ success: true, message: 'Password updated', token });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
