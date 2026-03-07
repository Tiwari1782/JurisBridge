const mongoose = require('mongoose');
const { SPECIALIZATIONS } = require('../utils/constants');

const LawyerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    barCouncilNumber: {
      type: String,
      required: [true, 'Bar Council enrollment number is required'],
      unique: true,
      trim: true,
    },
    specializations: {
      type: [String],
      required: [true, 'At least one specialization is required'],
      validate: {
        validator: function (arr) {
          return arr.length > 0 && arr.every((s) => SPECIALIZATIONS.includes(s));
        },
        message: 'Invalid specialization provided',
      },
    },
    experience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience seems too high'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalCases: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availability: [
      {
        day: {
          type: String,
          enum: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
        },
        slots: [
          {
            start: String, // "09:00"
            end: String,   // "17:00"
          },
        ],
      },
    ],
    languages: {
      type: [String],
      default: ['English'],
    },
    education: {
      type: String,
      default: '',
    },
    courtPractice: {
      type: String, // "Supreme Court", "High Court", "District Court"
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Populate user details when querying lawyer
LawyerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name email phone avatar location',
  });
  next();
});

module.exports = mongoose.model('Lawyer', LawyerSchema);