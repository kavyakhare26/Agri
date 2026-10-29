const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * Place after validation chain, before route handler.
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};
