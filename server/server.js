require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Connect to MongoDB
connectDB();

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/soil', require('./routes/soil'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/pest-alerts', require('./routes/pestAlerts'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'AgriConnect API running', env: process.env.NODE_ENV })
);

// 404 handler for unknown routes
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
);

module.exports = app;
