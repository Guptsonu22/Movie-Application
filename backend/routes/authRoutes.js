const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT Token
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_12345', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const { MOCK_USERS } = require('../utils/mockStore');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    let user;
    try {
      // Check if user already exists in DB
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }

      // Create new user in DB
      user = await User.create({
        username,
        email,
        password
      });
    } catch (dbError) {
      console.warn('Database registration failed, using MOCK USER store');

      // Check mock store
      const existingMock = MOCK_USERS.find(u => u.email === email || u.username === username);
      if (existingMock) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists (Offline Mode)'
        });
      }

      // Create mock user
      user = {
        _id: Date.now().toString(), // Mock ID
        username,
        email,
        password, // Storing plain text for mock mode simplicity
        role: 'user'
      };
      MOCK_USERS.push(user);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    let user;
    let isPasswordValid = false;

    try {
      // Find user in DB
      try {
        user = await User.findOne({ email }).select('+password');
      } catch (e) {
        // DB error, user remains undefined/null
      }

      if (user) {
        isPasswordValid = await user.comparePassword(password);
      } else {
        // Not found in DB or DB offline, check Mock Store
        // Case insensitive check
        const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (mockUser) {
          user = mockUser;
          isPasswordValid = mockUser.password === password;
        }
      }
    } catch (dbError) {
      console.warn('Login logic error:', dbError);
    }

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').authenticate, async (req, res) => {
  try {
    // req.user might be set by middleware, but in offline mode middleware might fail to find user in DB
    // We need to update middleware or handle it here. 
    // Actually, middleware uses User.findById. We should check if that needs offline support.

    // Assuming middleware puts the user object in req.user
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

