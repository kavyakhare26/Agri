/**
 * Global error handler middleware.
 * Must be registered LAST in the Express app.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((v) => v.message).join(', ');
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
