const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['planting', 'watering', 'fertilizing', 'pest_control', 'harvesting', 'observation', 'other'],
  },
  note: String,
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const CropSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  variety: String,
  growthStage: {
    type: String,
    enum: ['seed', 'germination', 'vegetative', 'flowering', 'fruiting', 'ripening', 'harvested'],
    default: 'seed',
  },
  plantingDate: Date,
  expectedHarvestDate: Date,
  actualHarvestDate: Date,
  areaHectares: Number,
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
  notes: String,
  activityLog: [ActivitySchema],
}, { timestamps: true });

module.exports = mongoose.model('Crop', CropSchema);
