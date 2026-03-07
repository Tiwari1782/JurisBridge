const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: [true, 'Lawyer ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: '',
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per lawyer
ReviewSchema.index({ lawyerId: 1, userId: 1 }, { unique: true });

// Static method to calculate average rating for a lawyer
ReviewSchema.statics.calculateAverageRating = async function (lawyerId) {
  const result = await this.aggregate([
    { $match: { lawyerId: lawyerId } },
    {
      $group: {
        _id: '$lawyerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (result.length > 0) {
      await mongoose.model('Lawyer').findByIdAndUpdate(lawyerId, {
        rating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: result[0].totalReviews,
      });
    } else {
      await mongoose.model('Lawyer').findByIdAndUpdate(lawyerId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (err) {
    console.error('Error calculating average rating:', err);
  }
};

// Recalculate rating after save
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.lawyerId);
});

// Recalculate rating after delete
ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.lawyerId);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);