const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    medicalName: {
      type: String,
      required: [true, 'Medical store name is required'],
      trim: true,
      maxlength: [100, 'Medical store name cannot exceed 100 characters'],
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
      maxlength: [50, 'Owner name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    contactNo: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^[0-9+\-\s()]+$/, 'Please enter a valid contact number'],
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
    drugLicenseNo: {
      type: String,
      required: [true, 'Drug license number is required'],
      unique: true,
      uppercase: true,
    },
    drugLicenseImage: {
      public_id: String,
      url: String,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['owner', 'staff', 'admin'],
      default: 'owner',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get full address
userSchema.methods.getFullAddress = function () {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return this.ownerName;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
