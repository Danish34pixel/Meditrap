const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { protect, generateToken } = require('../middleware/auth');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  [
    body('medicalName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Medical store name must be between 2 and 100 characters'),
    body('ownerName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Owner name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('contactNo')
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('Please provide a valid contact number'),
    body('address.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('address.pincode')
      .matches(/^[0-9]{6}$/)
      .withMessage('Please provide a valid 6-digit pincode'),
    body('drugLicenseNo')
      .trim()
      .notEmpty()
      .withMessage('Drug license number is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      medicalName,
      ownerName,
      email,
      contactNo,
      address,
      drugLicenseNo,
      password,
      drugLicenseImage,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { drugLicenseNo }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(new ErrorResponse('Email already registered', 400));
      }
      if (existingUser.drugLicenseNo === drugLicenseNo) {
        return next(
          new ErrorResponse('Drug license number already registered', 400),
        );
      }
    }

    // Create user
    const user = await User.create({
      medicalName,
      ownerName,
      email,
      contactNo,
      address,
      drugLicenseNo,
      password,
      drugLicenseImage,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        medicalName: user.medicalName,
        ownerName: user.ownerName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  }),
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorResponse('Account is deactivated', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        medicalName: user.medicalName,
        ownerName: user.ownerName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  }),
);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user,
    });
  }),
);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('medicalName').optional().trim().isLength({ min: 2, max: 100 }),
    body('ownerName').optional().trim().isLength({ min: 2, max: 50 }),
    body('contactNo')
      .optional()
      .matches(/^[0-9+\-\s()]+$/),
    body('address.street').optional().trim().notEmpty(),
    body('address.city').optional().trim().notEmpty(),
    body('address.state').optional().trim().notEmpty(),
    body('address.pincode')
      .optional()
      .matches(/^[0-9]{6}$/),
  ],
  asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  }),
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }),
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = router;
