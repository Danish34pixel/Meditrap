const mongoose = require('mongoose');

const stockistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stockist name is required'],
      trim: true,
      maxlength: [100, 'Stockist name cannot exceed 100 characters'],
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
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
      street: {
        type: String,
        required: [true, 'Street address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode'],
      },
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    medicines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
      },
    ],
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
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
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
          'general',
        ],
      },
    ],
    deliveryAreas: [
      {
        city: String,
        state: String,
        deliveryTime: String,
      },
    ],
    paymentTerms: {
      type: String,
      enum: ['cash', 'credit', 'both'],
      default: 'both',
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for search functionality
stockistSchema.index({
  name: 'text',
  'address.city': 'text',
  'address.state': 'text',
  specializations: 'text',
});

// Virtual for average rating
stockistSchema.virtual('averageRating').get(function () {
  return this.totalRatings > 0
    ? (this.rating / this.totalRatings).toFixed(1)
    : 0;
});

// Virtual for full address
stockistSchema.virtual('fullAddress').get(function () {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Method to add rating
stockistSchema.methods.addRating = function (newRating) {
  this.rating += newRating;
  this.totalRatings += 1;
  return this.save();
};

// Ensure virtual fields are serialized
stockistSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Stockist', stockistSchema);
