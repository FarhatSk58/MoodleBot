const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseHelper');

/**
 * verifyToken — Extract and verify JWT from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

/**
 * authorizeRoles — Factory middleware that restricts access by role.
 * Usage: authorizeRoles('admin', 'teacher')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access forbidden. Requires one of: [${roles.join(', ')}]`
      );
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
