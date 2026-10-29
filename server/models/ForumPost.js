const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const ForumPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['general', 'soil', 'crop', 'pest', 'market', 'weather', 'equipment'],
  },
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  isModerated: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', ForumPostSchema);
