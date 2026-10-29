const mongoose = require('mongoose');

const WeatherDataSchema = new mongoose.Schema({
  location: { type: String, required: true },
  lat: Number,
  lng: Number,
  current: {
    temp: Number,
    feelsLike: Number,
    humidity: Number,
    windSpeed: Number,
    description: String,
    icon: String,
    visibility: Number,
  },
  forecast: [{
    date: Date,
    tempMin: Number,
    tempMax: Number,
    humidity: Number,
    description: String,
    icon: String,
    rainProbability: Number,
  }],
  fetchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('WeatherData', WeatherDataSchema);
