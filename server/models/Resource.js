const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['seed', 'fertilizer', 'pesticide', 'tool', 'equipment', 'other'],
    required: true,
  },
  description: String,
  price: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g. "per kg", "per bag"
  stock: { type: Number, default: 0 },
  imageUrl: String,
  brand: String,
  isApproved: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
