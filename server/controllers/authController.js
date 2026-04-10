const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Generate JWT token for a user (no expiry — logout is client-side)
 */
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role, email: user.email, department: user.department },
    process.env.JWT_SECRET
  );
};

/**
 * Strip password from user object before returning
 */
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, year, semester } = req.body;

    // Email domain check
    const domain = process.env.COLLEGE_EMAIL_DOMAIN || 'college.edu';
    if (!email.endsWith(`@${domain}`)) {
      return sendError(res, 400, `Email must be from the domain @${domain}`);
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email already exists.');
    }

    // Build user data
    const userData = { name, email, password, role };
    if (role === 'student' || role === 'teacher') {
      userData.department = department;
    }
    if (role === 'student') {
      userData.year = year;
      userData.semester = semester;
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user);

    return sendSuccess(res, 201, 'Registration successful.', {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'An account with this email already exists.');
    }
    if (error.name === 'ValidationError') {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user — explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user);

    return sendSuccess(res, 200, 'Login successful.', {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }
    return sendSuccess(res, 200, 'Current user fetched.', sanitizeUser(user));
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const updateMe = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    const passwordChangeRequested = Boolean(newPassword || currentPassword);
    if (passwordChangeRequested) {
      if (!currentPassword || !newPassword) {
        return sendError(res, 400, 'Current password and new password are required.');
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 400, 'Current password is incorrect.');
      }

      user.password = newPassword;
    }

    await user.save();

    const token = generateToken(user);

    return sendSuccess(res, 200, 'Profile updated successfully.', {
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return sendError(res, 400, error.message);
    }
    return sendError(res, 500, error.message);
  }
};

module.exports = { register, login, getMe, updateMe };
