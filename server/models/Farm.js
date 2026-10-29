const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: {
    village: String,
    district: String,
    state: String,
    lat: Number,
    lng: Number,
  },
  areaHectares: { type: Number, required: true },
  soilType: { type: String, enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'other'] },
  irrigationType: { type: String, enum: ['drip', 'sprinkler', 'flood', 'rainfed', 'other'] },
  description: String,
  soilReadings: [{
    pH: Number,
    N: Number,
    P: Number,
    K: Number,
    moisture: Number,
    recordedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Farm', FarmSchema);
