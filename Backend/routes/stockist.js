const express = require('express');
const { body, query, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const Stockist = require('../models/Stockist');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all stockists
// @route   GET /api/stockist
// @access  Public
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim(),
    query('city').optional().trim(),
    query('state').optional().trim(),
    query('specialization').optional().trim(),
    query('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('Rating must be between 0 and 5'),
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by city
    if (req.query.city) {
      query['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    // Filter by state
    if (req.query.state) {
      query['address.state'] = { $regex: req.query.state, $options: 'i' };
    }

    // Filter by specialization
    if (req.query.specialization) {
      query.specializations = { $in: [req.query.specialization] };
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = { $gte: parseFloat(req.query.rating) };
    }

    // Execute query
    const stockists = await Stockist.find(query)
      .populate('companies', 'name shortName')
      .populate('medicines', 'name genericName brandName')
      .sort({ rating: -1, name: 1 })
      .skip(startIndex)
      .limit(limit);

    // Get total count
    const total = await Stockist.countDocuments(query);

    // Pagination info
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    res.json({
      success: true,
      count: stockists.length,
      pagination,
      data: stockists,
    });
  }),
);

// @desc    Get single stockist
// @route   GET /api/stockist/:id
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const stockist = await Stockist.findById(req.params.id)
      .populate('companies', 'name shortName description logo')
      .populate(
        'medicines',
        'name genericName brandName dosageForm strength price',
      );

    if (!stockist) {
      return next(new ErrorResponse('Stockist not found', 404));
    }

    if (!stockist.isActive) {
      return next(new ErrorResponse('Stockist is not active', 404));
    }

    res.json({
      success: true,
      data: stockist,
    });
  }),
);

// @desc    Create new stockist
// @route   POST /api/stockist
// @access  Private (Admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('contactPerson')
      .trim()
      .notEmpty()
      .withMessage('Contact person is required'),
    body('phone')
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('Please provide a valid phone number'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('address.street')
      .trim()
      .notEmpty()
      .withMessage('Street address is required'),
    body('address.city').trim().notEmpty().withMessage('City is required'),
    body('address.state').trim().notEmpty().withMessage('State is required'),
    body('address.pincode')
      .matches(/^[0-9]{6}$/)
      .withMessage('Please provide a valid 6-digit pincode'),
    body('licenseNumber')
      .trim()
      .notEmpty()
      .withMessage('License number is required'),
    body('licenseExpiry')
      .isISO8601()
      .withMessage('Please provide a valid expiry date'),
    body('specializations')
      .optional()
      .isArray()
      .withMessage('Specializations must be an array'),
    body('deliveryAreas')
      .optional()
      .isArray()
      .withMessage('Delivery areas must be an array'),
    body('paymentTerms')
      .optional()
      .isIn(['cash', 'credit', 'both'])
      .withMessage('Invalid payment terms'),
    body('minimumOrder')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum order must be a positive number'),
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

    // Check if license number already exists
    const existingStockist = await Stockist.findOne({
      licenseNumber: req.body.licenseNumber,
    });
    if (existingStockist) {
      return next(new ErrorResponse('License number already registered', 400));
    }

    const stockist = await Stockist.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Stockist created successfully',
      data: stockist,
    });
  }),
);

// @desc    Update stockist
// @route   PUT /api/stockist/:id
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('contactPerson').optional().trim().notEmpty(),
    body('phone')
      .optional()
      .matches(/^[0-9+\-\s()]+$/),
    body('email').optional().isEmail().normalizeEmail(),
    body('address.street').optional().trim().notEmpty(),
    body('address.city').optional().trim().notEmpty(),
    body('address.state').optional().trim().notEmpty(),
    body('address.pincode')
      .optional()
      .matches(/^[0-9]{6}$/),
    body('licenseExpiry').optional().isISO8601(),
    body('specializations').optional().isArray(),
    body('deliveryAreas').optional().isArray(),
    body('paymentTerms').optional().isIn(['cash', 'credit', 'both']),
    body('minimumOrder').optional().isFloat({ min: 0 }),
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

    let stockist = await Stockist.findById(req.params.id);

    if (!stockist) {
      return next(new ErrorResponse('Stockist not found', 404));
    }

    stockist = await Stockist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Stockist updated successfully',
      data: stockist,
    });
  }),
);

// @desc    Delete stockist
// @route   DELETE /api/stockist/:id
// @access  Private (Admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const stockist = await Stockist.findById(req.params.id);

    if (!stockist) {
      return next(new ErrorResponse('Stockist not found', 404));
    }

    // Soft delete - mark as inactive
    stockist.isActive = false;
    await stockist.save();

    res.json({
      success: true,
      message: 'Stockist deleted successfully',
    });
  }),
);

// @desc    Rate stockist
// @route   POST /api/stockist/:id/rate
// @access  Private
router.post(
  '/:id/rate',
  protect,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
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

    const stockist = await Stockist.findById(req.params.id);

    if (!stockist) {
      return next(new ErrorResponse('Stockist not found', 404));
    }

    if (!stockist.isActive) {
      return next(new ErrorResponse('Stockist is not active', 404));
    }

    const { rating } = req.body;

    // Add rating
    await stockist.addRating(rating);

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: {
        rating: stockist.rating,
        totalRatings: stockist.totalRatings,
        averageRating: stockist.averageRating,
      },
    });
  }),
);

// @desc    Get stockist statistics
// @route   GET /api/stockist/stats/overview
// @access  Private (Admin only)
router.get(
  '/stats/overview',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const totalStockists = await Stockist.countDocuments();
    const activeStockists = await Stockist.countDocuments({ isActive: true });
    const verifiedStockists = await Stockist.countDocuments({
      isVerified: true,
    });
    const avgRating = await Stockist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    const topStockists = await Stockist.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5)
      .select('name rating totalRatings');

    res.json({
      success: true,
      data: {
        totalStockists,
        activeStockists,
        verifiedStockists,
        averageRating:
          avgRating.length > 0
            ? Math.round(avgRating[0].avgRating * 100) / 100
            : 0,
        topStockists,
      },
    });
  }),
);

module.exports = router;
