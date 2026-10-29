const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  isExpert: { type: Boolean, default: false },
}, { timestamps: true });

const ConsultationSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  question: { type: String, required: true },
  category: {
    type: String,
    enum: ['soil', 'crop', 'pest', 'weather', 'market', 'equipment', 'other'],
  },
  status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
  replies: [ReplySchema],
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Consultation', ConsultationSchema);
