const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const Review = require('../models/Review');
const { AppError } = require('../middleware/errorHandler');
const { getPagination } = require('../utils/helpers');
const { SPECIALIZATIONS } = require('../utils/constants');

// @desc    Get all verified lawyers (with filters)
// @route   GET /api/lawyers
// @access  Public
const getAllLawyers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const {
      specialization,
      minFee,
      maxFee,
      minRating,
      minExperience,
      city,
      state,
      language,
      sortBy,
      available,
      search,
    } = req.query;

    // Build filter
    const filter = { isVerified: true };

    // Specialization filter
    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }

    // Fee range filter
    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = parseFloat(minFee);
      if (maxFee) filter.consultationFee.$lte = parseFloat(maxFee);
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Experience filter
    if (minExperience) {
      filter.experience = { $gte: parseInt(minExperience) };
    }

    // Availability filter
    if (available === 'true') {
      filter.isAvailable = true;
    }

    // Language filter
    if (language) {
      filter.languages = { $in: [language] };
    }

    // Build sort
    let sort = { rating: -1 }; // Default: highest rated first
    if (sortBy === 'fee_low') sort = { consultationFee: 1 };
    if (sortBy === 'fee_high') sort = { consultationFee: -1 };
    if (sortBy === 'experience') sort = { experience: -1 };
    if (sortBy === 'rating') sort = { rating: -1 };
    if (sortBy === 'reviews') sort = { totalReviews: -1 };
    if (sortBy === 'newest') sort = { createdAt: -1 };

    // Get total count
    const total = await Lawyer.countDocuments(filter);

    // Fetch lawyers
    let lawyers = await Lawyer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Post-query filters (on populated User fields)
    if (city || state || search) {
      lawyers = lawyers.filter((lawyer) => {
        let match = true;

        if (city && lawyer.userId?.location?.city) {
          match = match && lawyer.userId.location.city.toLowerCase().includes(city.toLowerCase());
        }

        if (state && lawyer.userId?.location?.state) {
          match = match && lawyer.userId.location.state.toLowerCase().includes(state.toLowerCase());
        }

        if (search && lawyer.userId?.name) {
          match = match && lawyer.userId.name.toLowerCase().includes(search.toLowerCase());
        }

        return match;
      });
    }

    res.status(200).json({
      success: true,
      count: lawyers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: lawyers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lawyer by ID
// @route   GET /api/lawyers/:id
// @access  Public
const getLawyerById = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id).select('-__v');

    if (!lawyer) {
      return next(new AppError('Lawyer not found', 404));
    }

    // Get reviews for this lawyer
    const reviews = await Review.find({ lawyerId: lawyer._id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        lawyer,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby lawyers (geospatial)
// @route   GET /api/lawyers/nearby
// @access  Public
const getNearbyLawyers = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance, specialization } = req.query;

    if (!lng || !lat) {
      return next(new AppError('Please provide longitude (lng) and latitude (lat)', 400));
    }

    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    const distance = parseInt(maxDistance) || 50; // Default 50km

    // First find users near the location
    const nearbyUsers = await User.find({
      role: 'lawyer',
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: distance * 1000, // Convert km to meters
        },
      },
    }).select('_id');

    const userIds = nearbyUsers.map((u) => u._id);

    // Build lawyer filter
    const filter = {
      userId: { $in: userIds },
      isVerified: true,
    };

    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }

    const lawyers = await Lawyer.find(filter)
      .sort({ rating: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: lawyers.length,
      data: lawyers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lawyers by specialization
// @route   GET /api/lawyers/specialization/:type
// @access  Public
const getLawyersBySpecialization = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);

    // Validate specialization
    if (!SPECIALIZATIONS.includes(type)) {
      return next(
        new AppError(
          `Invalid specialization. Available: ${SPECIALIZATIONS.join(', ')}`,
          400
        )
      );
    }

    const filter = {
      specializations: { $in: [type] },
      isVerified: true,
    };

    const total = await Lawyer.countDocuments(filter);
    const lawyers = await Lawyer.find(filter)
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.status(200).json({
      success: true,
      count: lawyers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      specialization: type,
      data: lawyers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available specializations
// @route   GET /api/lawyers/specializations/list
// @access  Public
const getSpecializations = async (req, res, next) => {
  try {
    // Get count of lawyers per specialization
    const stats = await Lawyer.aggregate([
      { $match: { isVerified: true } },
      { $unwind: '$specializations' },
      {
        $group: {
          _id: '$specializations',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Merge with full list (include zero-count specializations)
    const specializations = SPECIALIZATIONS.map((spec) => {
      const found = stats.find((s) => s._id === spec);
      return {
        name: spec,
        lawyerCount: found ? found.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: specializations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a review for a lawyer
// @route   POST /api/lawyers/:id/reviews
// @access  Private (Users only)
const submitReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const lawyerId = req.params.id;

    // Check if lawyer exists
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) {
      return next(new AppError('Lawyer not found', 404));
    }

    // Prevent lawyers from reviewing themselves
    if (lawyer.userId._id.toString() === req.user.id) {
      return next(new AppError('You cannot review yourself', 400));
    }

    // Check if user already reviewed this lawyer
    const existingReview = await Review.findOne({
      lawyerId,
      userId: req.user.id,
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this lawyer', 400));
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    const review = await Review.create({
      lawyerId,
      userId: req.user.id,
      rating,
      title: title || '',
      comment: comment || '',
    });

    // Populate user info in response
    await review.populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a lawyer
// @route   GET /api/lawyers/:id/reviews
// @access  Public
const getLawyerReviews = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const lawyerId = req.params.id;

    // Check if lawyer exists
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) {
      return next(new AppError('Lawyer not found', 404));
    }

    const total = await Review.countDocuments({ lawyerId });
    const reviews = await Review.find({ lawyerId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      averageRating: lawyer.rating,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own review
// @route   DELETE /api/lawyers/:id/reviews
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      lawyerId: req.params.id,
      userId: req.user.id,
    });

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a lawyer (Admin only — for now we'll use this to test)
// @route   PUT /api/lawyers/:id/verify
// @access  Private (Admin / for testing)
const verifyLawyer = async (req, res, next) => {
  try {
    const lawyer = await Lawyer.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!lawyer) {
      return next(new AppError('Lawyer not found', 404));
    }

    res.status(200).json({
      success: true,
      message: `Lawyer ${lawyer.userId.name} has been verified ✅`,
      data: lawyer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLawyers,
  getLawyerById,
  getNearbyLawyers,
  getLawyersBySpecialization,
  getSpecializations,
  submitReview,
  getLawyerReviews,
  deleteReview,
  verifyLawyer,
};