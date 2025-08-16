const express = require('express');
const { body, query, validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const Medicine = require('../models/Medicine');
const Company = require('../models/Company');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all medicines
// @route   GET /api/medicine
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
    query('company').optional().trim(),
    query('dosageForm').optional().trim(),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be positive'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be positive'),
    query('prescriptionRequired')
      .optional()
      .isBoolean()
      .withMessage('Prescription required must be boolean'),
    query('sortBy')
      .optional()
      .isIn(['name', 'price', 'rating', 'createdAt'])
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

    // Filter by company
    if (req.query.company) {
      const company = await Company.findOne({
        name: { $regex: req.query.company, $options: 'i' },
      });
      if (company) {
        query.company = company._id;
      }
    }

    // Filter by dosage form
    if (req.query.dosageForm) {
      query.dosageForm = req.query.dosageForm;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query['price.mrp'] = {};
      if (req.query.minPrice) {
        query['price.mrp'].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query['price.mrp'].$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filter by prescription requirement
    if (req.query.prescriptionRequired !== undefined) {
      query.prescriptionRequired = req.query.prescriptionRequired === 'true';
    }

    // Build sort object
    let sort = {};
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder || 'asc';
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const medicines = await Medicine.find(query)
      .populate('company', 'name shortName logo')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    // Get total count
    const total = await Medicine.countDocuments(query);

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
      count: medicines.length,
      pagination,
      data: medicines,
    });
  }),
);

// @desc    Get single medicine
// @route   GET /api/medicine/:id
// @access  Public
router.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    const medicine = await Medicine.findById(req.params.id)
      .populate('company', 'name shortName description logo website')
      .populate('stockists.stockist', 'name contactPerson phone address')
      .populate('reviews.user', 'medicalName ownerName');

    if (!medicine) {
      return next(new ErrorResponse('Medicine not found', 404));
    }

    if (!medicine.isActive) {
      return next(new ErrorResponse('Medicine is not active', 404));
    }

    res.json({
      success: true,
      data: medicine,
    });
  }),
);

// @desc    Create new medicine
// @route   POST /api/medicine
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
    body('genericName').optional().trim().isLength({ min: 2, max: 100 }),
    body('brandName').optional().trim().isLength({ min: 2, max: 100 }),
    body('company').isMongoId().withMessage('Valid company ID is required'),
    body('category')
      .isIn([
        'antibiotics',
        'painkillers',
        'vitamins',
        'diabetes',
        'cardiac',
        'oncology',
        'pediatrics',
        'general',
        'other',
      ])
      .withMessage('Invalid category'),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('dosageForm')
      .isIn([
        'tablet',
        'capsule',
        'syrup',
        'injection',
        'cream',
        'ointment',
        'drops',
        'inhaler',
        'other',
      ])
      .withMessage('Invalid dosage form'),
    body('strength').trim().notEmpty().withMessage('Strength is required'),
    body('packSize').trim().notEmpty().withMessage('Pack size is required'),
    body('price.mrp')
      .isFloat({ min: 0 })
      .withMessage('MRP must be a positive number'),
    body('price.tradePrice').optional().isFloat({ min: 0 }),
    body('price.retailPrice').optional().isFloat({ min: 0 }),
    body('prescriptionRequired').optional().isBoolean(),
    body('schedule')
      .optional()
      .isIn(['OTC', 'Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G']),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('batchNumber')
      .trim()
      .notEmpty()
      .withMessage('Batch number is required'),
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

    // Check if company exists
    const company = await Company.findById(req.body.company);
    if (!company) {
      return next(new ErrorResponse('Company not found', 404));
    }

    const medicine = await Medicine.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: medicine,
    });
  }),
);

// @desc    Update medicine
// @route   PUT /api/medicine/:id
// @access  Private (Admin only)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('genericName').optional().trim().isLength({ min: 2, max: 100 }),
    body('brandName').optional().trim().isLength({ min: 2, max: 100 }),
    body('category')
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
        'other',
      ]),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('dosageForm')
      .optional()
      .isIn([
        'tablet',
        'capsule',
        'syrup',
        'injection',
        'cream',
        'ointment',
        'drops',
        'inhaler',
        'other',
      ]),
    body('strength').optional().trim().notEmpty(),
    body('packSize').optional().trim().notEmpty(),
    body('price.mrp').optional().isFloat({ min: 0 }),
    body('price.tradePrice').optional().isFloat({ min: 0 }),
    body('price.retailPrice').optional().isFloat({ min: 0 }),
    body('prescriptionRequired').optional().isBoolean(),
    body('schedule')
      .optional()
      .isIn(['OTC', 'Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G']),
    body('expiryDate').optional().isISO8601(),
    body('batchNumber').optional().trim().notEmpty(),
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

    let medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return next(new ErrorResponse('Medicine not found', 404));
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine,
    });
  }),
);

// @desc    Delete medicine
// @route   DELETE /api/medicine/:id
// @access  Private (Admin only)
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res, next) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return next(new ErrorResponse('Medicine not found', 404));
    }

    // Soft delete - mark as inactive
    medicine.isActive = false;
    await medicine.save();

    res.json({
      success: true,
      message: 'Medicine deleted successfully',
    });
  }),
);

// @desc    Add review to medicine
// @route   POST /api/medicine/:id/review
// @access  Private
router.post(
  '/:id/review',
  protect,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Comment cannot exceed 500 characters'),
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

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return next(new ErrorResponse('Medicine not found', 404));
    }

    if (!medicine.isActive) {
      return next(new ErrorResponse('Medicine is not active', 404));
    }

    const { rating, comment } = req.body;

    // Check if user already reviewed this medicine
    const existingReview = medicine.reviews.find(
      review => review.user.toString() === req.user.id,
    );

    if (existingReview) {
      return next(
        new ErrorResponse('You have already reviewed this medicine', 400),
      );
    }

    // Add review
    medicine.reviews.push({
      user: req.user.id,
      rating,
      comment,
    });

    // Update rating
    await medicine.addRating(rating);

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        rating: medicine.rating,
        totalRatings: medicine.totalRatings,
        averageRating: medicine.averageRating,
      },
    });
  }),
);

// @desc    Update stock for medicine
// @route   PUT /api/medicine/:id/stock
// @access  Private (Admin/Stockist only)
router.put(
  '/:id/stock',
  protect,
  authorize('admin'),
  [
    body('stockistId').isMongoId().withMessage('Valid stockist ID is required'),
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
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

    const { stockistId, stock } = req.body;

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return next(new ErrorResponse('Medicine not found', 404));
    }

    // Update stock
    await medicine.updateStock(stockistId, stock);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        totalStock: medicine.totalStock,
        stockists: medicine.stockists,
      },
    });
  }),
);

// @desc    Get medicine statistics
// @route   GET /api/medicine/stats/overview
// @access  Private (Admin only)
router.get(
  '/stats/overview',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const totalMedicines = await Medicine.countDocuments();
    const activeMedicines = await Medicine.countDocuments({ isActive: true });
    const verifiedMedicines = await Medicine.countDocuments({
      isVerified: true,
    });

    // Medicines by category
    const medicinesByCategory = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Medicines by dosage form
    const medicinesByDosageForm = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$dosageForm', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top rated medicines
    const topMedicines = await Medicine.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5)
      .select('name genericName brandName rating totalRatings');

    res.json({
      success: true,
      data: {
        totalMedicines,
        activeMedicines,
        verifiedMedicines,
        medicinesByCategory,
        medicinesByDosageForm,
        topMedicines,
      },
    });
  }),
);

module.exports = router;
