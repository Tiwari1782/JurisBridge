const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const { AppError } = require('../middleware/errorHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      language: language || 'en',
      role: 'user',
    });

    // Generate token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: '🔨 Welcome to JurisBridge! Your account has been created.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        language: user.language,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new lawyer
// @route   POST /api/auth/register/lawyer
// @access  Public
const registerLawyer = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      language,
      barCouncilNumber,
      specializations,
      experience,
      consultationFee,
      bio,
      education,
      courtPractice,
      languages,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400));
    }

    // Check if bar council number is already registered
    const existingLawyer = await Lawyer.findOne({ barCouncilNumber });
    if (existingLawyer) {
      return next(new AppError('This Bar Council number is already registered', 400));
    }

    // Create user account with lawyer role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      language: language || 'en',
      role: 'lawyer',
    });

    // Create lawyer profile linked to user
    const lawyer = await Lawyer.create({
      userId: user._id,
      barCouncilNumber,
      specializations,
      experience,
      consultationFee,
      bio: bio || '',
      education: education || '',
      courtPractice: courtPractice || '',
      languages: languages || ['English'],
    });

    // Generate token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: '⚖️ Welcome to JurisBridge! Your lawyer account is pending verification.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        language: user.language,
      },
      lawyer: {
        id: lawyer._id,
        barCouncilNumber: lawyer.barCouncilNumber,
        specializations: lawyer.specializations,
        experience: lawyer.experience,
        consultationFee: lawyer.consultationFee,
        isVerified: lawyer.isVerified,
      },
    });
  } catch (error) {
    // If lawyer creation fails, delete the user account too
    if (error && req.body.email) {
      await User.findOneAndDelete({ email: req.body.email });
    }
    next(error);
  }
};

// @desc    Login user / lawyer
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Contact support.', 403));
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate token
    const token = user.generateToken();

    // If lawyer, fetch lawyer profile too
    let lawyerProfile = null;
    if (user.role === 'lawyer') {
      lawyerProfile = await Lawyer.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      message: `🔨 Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        language: user.language,
        avatar: user.avatar,
      },
      ...(lawyerProfile && {
        lawyer: {
          id: lawyerProfile._id,
          specializations: lawyerProfile.specializations,
          isVerified: lawyerProfile.isVerified,
          rating: lawyerProfile.rating,
        },
      }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // If lawyer, include lawyer profile
    let lawyerProfile = null;
    if (user.role === 'lawyer') {
      lawyerProfile = await Lawyer.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      ...(lawyerProfile && { lawyer: lawyerProfile }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'language', 'avatar'];
    const updates = {};

    // Only pick allowed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update location if provided
    if (req.body.location) {
      updates.location = {
        type: 'Point',
        coordinates: req.body.location.coordinates || [0, 0],
        address: req.body.location.address || '',
        city: req.body.location.city || '',
        state: req.body.location.state || '',
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lawyer profile
// @route   PUT /api/auth/lawyer-profile
// @access  Private (Lawyer only)
const updateLawyerProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'specializations',
      'consultationFee',
      'bio',
      'availability',
      'isAvailable',
      'languages',
      'education',
      'courtPractice',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const lawyer = await Lawyer.findOneAndUpdate(
      { userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!lawyer) {
      return next(new AppError('Lawyer profile not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Lawyer profile updated successfully',
      lawyer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  registerLawyer,
  loginUser,
  getMe,
  updateProfile,
  updateLawyerProfile,
};