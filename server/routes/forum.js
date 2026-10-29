const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ForumPost = require('../models/ForumPost');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// ─── GET /api/forum ── all posts, paginated, searchable ─────────────────────
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } },
      ];
    }

    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .populate('author', 'name role state')
        .select('-comments')
        .skip(skip)
        .limit(limit)
        .sort({ isPinned: -1, createdAt: -1 }),
      ForumPost.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/forum ── any authenticated user ───────────────────────────────
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category')
      .optional()
      .isIn(['general', 'soil', 'crop', 'pest', 'market', 'weather', 'equipment']),
    body('tags').optional().isArray(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const post = await ForumPost.create({ ...req.body, author: req.user._id });
      await post.populate('author', 'name role');
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/forum/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role state')
      .populate('comments.author', 'name role');
    if (!post) return res.status(404).json({ success: false, message: 'Forum post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/forum/:id/comments ── add comment ────────────────────────────
router.post(
  '/:id/comments',
  [body('content').trim().notEmpty().withMessage('Comment content is required')],
  validate,
  async (req, res, next) => {
    try {
      const post = await ForumPost.findById(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Forum post not found' });

      post.comments.push({ author: req.user._id, content: req.body.content });
      await post.save();
      await post.populate('comments.author', 'name role');

      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/forum/:id/like ── toggle like on a post ───────────────────────
router.put('/:id/like', async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Forum post not found' });

    const userId = req.user._id.toString();
    const likedIndex = post.likes.findIndex((id) => id.toString() === userId);

    if (likedIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likedIndex, 1);
    }

    await post.save();
    res.json({
      success: true,
      liked: likedIndex === -1,
      likeCount: post.likes.length,
      data: post,
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/forum/:id ── author or admin ────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Forum post not found' });

    const isAuthor = post.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Forum post deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/forum/:id/moderate ── admin: set moderation flags ─────────────
router.put(
  '/:id/moderate',
  authorize('admin'),
  [
    body('isModerated').optional().isBoolean(),
    body('isPinned').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const updates = {};
      if (req.body.isModerated !== undefined) updates.isModerated = req.body.isModerated;
      if (req.body.isPinned !== undefined) updates.isPinned = req.body.isPinned;

      const post = await ForumPost.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).populate('author', 'name role');

      if (!post) return res.status(404).json({ success: false, message: 'Forum post not found' });
      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
