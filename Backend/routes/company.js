const express = require('express');
const { body, query, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const Company = require('../models/Company');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all companies
// @route   GET /api/company
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
    query('category').optional().trim(),
    query('specialization').optional().trim(),
    query('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('Rating must be between 0 and 5'),
    query('sortBy')
      .optional()
      .isIn(['name', 'rating', 'createdAt'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
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

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by specialization
    if (req.query.specialization) {
      query.specializations = { $in: [req.query.specialization] };
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = { $gte: parseFloat(req.query.rating) };
    }

    // Build sort object
    let sort = {};
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const companies = await Company.find(query)
      .populate('medicines', 'name genericName brandName dosageForm strength')
      .populate('stockists', 'name contactPerson phone address')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    // Get total count
    const total = await Company.countDocuments(query);

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
      count: companies.length,
      pagination,
      data: companies,
    });
  }),
);

// @desc    Get single company
// @route   GET /api/company/:id
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const company = await Company.findById(req.params.id)
      .populate(
        'medicines',
        'name genericName brandName dosageForm strength price category',
      )
      .populate(
        'stockists',
        'name contactPerson phone address specializations',
      );

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    if (!company.isActive) {
      return next(new ErrorResponse('Company is not active', 404));
    }

    res.json({
      success: true,
      data: company,
    });
  }),
);

// @desc    Create new company
// @route   POST /api/company
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
    body('shortName').optional().trim().isLength({ min: 1, max: 20 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('website')
      .optional()
      .isURL()
      .withMessage('Please provide a valid website URL'),
    body('contactInfo.phone')
      .optional()
      .matches(/^[0-9+\-\s()]+$/),
    body('contactInfo.email').optional().isEmail().normalizeEmail(),
    body('contactInfo.address.street').optional().trim().notEmpty(),
    body('contactInfo.address.city').optional().trim().notEmpty(),
    body('contactInfo.address.state').optional().trim().notEmpty(),
    body('contactInfo.address.country').optional().trim().notEmpty(),
    body('contactInfo.address.pincode').optional().trim(),
    body('licenseNumber')
      .trim()
      .notEmpty()
      .withMessage('License number is required'),
    body('licenseExpiry')
      .isISO8601()
      .withMessage('Please provide a valid expiry date'),
    body('category')
      .isIn(['multinational', 'national', 'regional', 'local'])
      .withMessage('Invalid category'),
    body('specializations')
      .optional()
      .isArray()
      .withMessage('Specializations must be an array'),
    body('specializations.*')
      .optional()
      .isIn([
        'antibiotics',
        'painkillers',
        'vitamins',
        'diabetes',
        'cardiac',
        'oncology',
        'pediatrics',
        'general',
      ])
      .withMessage('Invalid specialization'),
    body('certifications')
      .optional()
      .isArray()
      .withMessage('Certifications must be an array'),
    body('certifications.*.name').optional().trim().notEmpty(),
    body('certifications.*.issuedBy').optional().trim().notEmpty(),
    body('certifications.*.issuedDate').optional().isISO8601(),
    body('certifications.*.expiryDate').optional().isISO8601(),
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
    const existingCompany = await Company.findOne({
      licenseNumber: req.body.licenseNumber,
    });
    if (existingCompany) {
      return next(new ErrorResponse('License number already registered', 400));
    }

    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  }),
);

// @desc    Update company
// @route   PUT /api/company/:id
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('shortName').optional().trim().isLength({ min: 1, max: 20 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('website').optional().isURL(),
    body('contactInfo.phone')
      .optional()
      .matches(/^[0-9+\-\s()]+$/),
    body('contactInfo.email').optional().isEmail().normalizeEmail(),
    body('contactInfo.address.street').optional().trim().notEmpty(),
    body('contactInfo.address.city').optional().trim().notEmpty(),
    body('contactInfo.address.state').optional().trim().notEmpty(),
    body('contactInfo.address.country').optional().trim().notEmpty(),
    body('contactInfo.address.pincode').optional().trim(),
    body('licenseExpiry').optional().isISO8601(),
    body('category')
      .optional()
      .isIn(['multinational', 'national', 'regional', 'local']),
    body('specializations').optional().isArray(),
    body('specializations.*')
      .optional()
      .isIn([
        'antibiotics',
        'painkillers',
        'vitamins',
        'diabetes',
        'cardiac',
        'oncology',
        'pediatrics',
        'general',
      ]),
    body('certifications').optional().isArray(),
    body('certifications.*.name').optional().trim().notEmpty(),
    body('certifications.*.issuedBy').optional().trim().notEmpty(),
    body('certifications.*.issuedDate').optional().isISO8601(),
    body('certifications.*.expiryDate').optional().isISO8601(),
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

    let company = await Company.findById(req.params.id);

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company,
    });
  }),
);

// @desc    Delete company
// @route   DELETE /api/company/:id
// @access  Private (Admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    // Soft delete - mark as inactive
    company.isActive = false;
    await company.save();

    res.json({
      success: true,
      message: 'Company deleted successfully',
    });
  }),
);

// @desc    Rate company
// @route   POST /api/company/:id/rate
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

    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    if (!company.isActive) {
      return next(new ErrorResponse('Company is not active', 404));
    }

    const { rating } = req.body;

    // Add rating
    await company.addRating(rating);

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: {
        rating: company.rating,
        totalRatings: company.totalRatings,
        averageRating: company.averageRating,
      },
    });
  }),
);

// @desc    Verify company
// @route   PUT /api/company/:id/verify
// @access  Private (Admin only)
router.put(
  '/:id/verify',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    company.isVerified = true;
    await company.save();

    res.json({
      success: true,
      message: 'Company verified successfully',
      data: {
        id: company._id,
        name: company.name,
        isVerified: company.isVerified,
      },
    });
  }),
);

// @desc    Get company statistics
// @route   GET /api/company/stats/overview
// @access  Private (Admin only)
router.get(
  '/stats/overview',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ isActive: true });
    const verifiedCompanies = await Company.countDocuments({
      isVerified: true,
    });

    // Companies by category
    const companiesByCategory = await Company.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Companies by specialization
    const companiesBySpecialization = await Company.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$specializations' },
      { $group: { _id: '$specializations', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top rated companies
    const topCompanies = await Company.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5)
      .select('name shortName rating totalRatings');

    // Companies with expiring licenses (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringLicenses = await Company.find({
      isActive: true,
      licenseExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() },
    }).select('name licenseNumber licenseExpiry');

    res.json({
      success: true,
      data: {
        totalCompanies,
        activeCompanies,
        verifiedCompanies,
        companiesByCategory,
        companiesBySpecialization,
        topCompanies,
        expiringLicenses,
      },
    });
  }),
);

module.exports = router;
