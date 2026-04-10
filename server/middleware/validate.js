const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHelper');

/**
 * validate — catches express-validator errors and returns a 400 response.
 * Must be placed AFTER express-validator check() chains in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: errors.array(),
    });
  }

  next();
};

module.exports = validate;
