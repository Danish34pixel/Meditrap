const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/user
// @access  Private (Admin only)
router.get(
  '/',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  }),
);

// @desc    Get user by ID (Admin only)
// @route   GET /api/user/:id
// @access  Private (Admin only)
router.get(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.json({
      success: true,
      data: user,
    });
  }),
);

// @desc    Update user by ID (Admin only)
// @route   PUT /api/user/:id
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('medicalName').optional().trim().isLength({ min: 2, max: 100 }),
    body('ownerName').optional().trim().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('contactNo')
      .optional()
      .matches(/^[0-9+\-\s()]+$/),
    body('address.street').optional().trim().notEmpty(),
    body('address.city').optional().trim().notEmpty(),
    body('address.state').optional().trim().notEmpty(),
    body('address.pincode')
      .optional()
      .matches(/^[0-9]{6}$/),
    body('role').optional().isIn(['owner', 'staff', 'admin']),
    body('isVerified').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
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

    let user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  }),
);

// @desc    Delete user (Admin only)
// @route   DELETE /api/user/:id
// @access  Private (Admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  }),
);

// @desc    Verify user (Admin only)
// @route   PUT /api/user/:id/verify
// @access  Private (Admin only)
router.put(
  '/:id/verify',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'User verified successfully',
      data: {
        id: user._id,
        medicalName: user.medicalName,
        isVerified: user.isVerified,
      },
    });
  }),
);

// @desc    Get user statistics (Admin only)
// @route   GET /api/user/stats/overview
// @access  Private (Admin only)
router.get(
  '/stats/overview',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const owners = await User.countDocuments({ role: 'owner' });
    const staff = await User.countDocuments({ role: 'staff' });
    const admins = await User.countDocuments({ role: 'admin' });

    // Users by state
    const usersByState = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent registrations
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('medicalName ownerName email createdAt');

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        roleBreakdown: {
          owners,
          staff,
          admins,
        },
        usersByState,
        recentUsers,
      },
    });
  }),
);

module.exports = router;
