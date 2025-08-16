const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [100, 'Medicine name cannot exceed 100 characters'],
    },
    genericName: {
      type: String,
      trim: true,
      maxlength: [100, 'Generic name cannot exceed 100 characters'],
    },
    brandName: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'antibiotics',
        'painkillers',
        'vitamins',
        'diabetes',
        'cardiac',
        'oncology',
        'pediatrics',
        'general',
        'other',
      ],
    },
    subCategory: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    composition: [
      {
        ingredient: String,
        strength: String,
        unit: String,
      },
    ],
    dosageForm: {
      type: String,
      required: [true, 'Dosage form is required'],
      enum: [
        'tablet',
        'capsule',
        'syrup',
        'injection',
        'cream',
        'ointment',
        'drops',
        'inhaler',
        'other',
      ],
    },
    strength: {
      type: String,
      required: [true, 'Strength is required'],
    },
    packSize: {
      type: String,
      required: [true, 'Pack size is required'],
    },
    price: {
      mrp: {
        type: Number,
        required: [true, 'MRP is required'],
        min: [0, 'MRP cannot be negative'],
      },
      tradePrice: {
        type: Number,
        min: [0, 'Trade price cannot be negative'],
      },
      retailPrice: {
        type: Number,
        min: [0, 'Retail price cannot be negative'],
      },
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    schedule: {
      type: String,
      enum: ['OTC', 'Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G'],
      default: 'OTC',
    },
    storage: {
      type: String,
      default: 'Store in a cool, dry place',
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
    },
    image: {
      public_id: String,
      url: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    stockists: [
      {
        stockist: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Stockist',
        },
        stock: {
          type: Number,
          default: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          maxlength: [500, 'Review comment cannot exceed 500 characters'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sideEffects: [String],
    contraindications: [String],
    interactions: [String],
    pregnancyCategory: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'X'],
      default: 'C',
    },
  },
  {
    timestamps: true,
  },
);

// Index for search functionality
medicineSchema.index({
  name: 'text',
  genericName: 'text',
  brandName: 'text',
  description: 'text',
  category: 'text',
});

// Virtual for average rating
medicineSchema.virtual('averageRating').get(function () {
  return this.totalRatings > 0
    ? (this.rating / this.totalRatings).toFixed(1)
    : 0;
});

// Virtual for total stock
medicineSchema.virtual('totalStock').get(function () {
  return this.stockists.reduce((total, item) => total + item.stock, 0);
});

// Virtual for isExpired
medicineSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// Method to add rating
medicineSchema.methods.addRating = function (newRating) {
  this.rating += newRating;
  this.totalRatings += 1;
  return this.save();
};

// Method to update stock
medicineSchema.methods.updateStock = function (stockistId, newStock) {
  const stockistIndex = this.stockists.findIndex(
    s => s.stockist.toString() === stockistId.toString(),
  );
  if (stockistIndex > -1) {
    this.stockists[stockistIndex].stock = newStock;
    this.stockists[stockistIndex].lastUpdated = new Date();
  } else {
    this.stockists.push({
      stockist: stockistId,
      stock: newStock,
      lastUpdated: new Date(),
    });
  }
  return this.save();
};

// Ensure virtual fields are serialized
medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
