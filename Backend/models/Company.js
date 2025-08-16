const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    shortName: {
      type: String,
      trim: true,
      maxlength: [20, 'Short name cannot exceed 20 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      public_id: String,
      url: String,
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL'],
    },
    contactInfo: {
      phone: {
        type: String,
        match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'],
      },
      email: {
        type: String,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          'Please enter a valid email',
        ],
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: {
          type: String,
          default: 'India',
        },
        pincode: String,
      },
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      uppercase: true,
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },
    category: {
      type: String,
      enum: ['multinational', 'national', 'regional', 'local'],
      default: 'national',
    },
    specializations: [
      {
        type: String,
        enum: [
          'antibiotics',
          'painkillers',
          'vitamins',
          'diabetes',
          'cardiac',
          'oncology',
          'pediatrics',
          'general',
        ],
      },
    ],
    certifications: [
      {
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
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
    medicines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
      },
    ],
    stockists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stockist',
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for search functionality
companySchema.index({
  name: 'text',
  shortName: 'text',
  description: 'text',
  specializations: 'text',
});

// Virtual for average rating
companySchema.virtual('averageRating').get(function () {
  return this.totalRatings > 0
    ? (this.rating / this.totalRatings).toFixed(1)
    : 0;
});

// Virtual for full address
companySchema.virtual('fullAddress').get(function () {
  if (this.contactInfo.address) {
    const addr = this.contactInfo.address;
    return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''}, ${
      addr.country || ''
    } - ${addr.pincode || ''}`
      .replace(/^,\s*/, '')
      .replace(/,\s*$/, '');
  }
  return '';
});

// Method to add rating
companySchema.methods.addRating = function (newRating) {
  this.rating += newRating;
  this.totalRatings += 1;
  return this.save();
};

// Method to check if license is expired
companySchema.methods.isLicenseExpired = function () {
  return new Date() > this.licenseExpiry;
};

// Ensure virtual fields are serialized
companySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Company', companySchema);
