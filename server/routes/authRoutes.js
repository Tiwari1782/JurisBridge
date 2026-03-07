const express = require('express');
const router = express.Router();

// Controller
const {
  registerUser,
  registerLawyer,
  loginUser,
  getMe,
  updateProfile,
  updateLawyerProfile,
} = require('../controllers/authController');

// Middleware
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../utils/helpers');

// Validators
const {
  registerValidator,
  loginValidator,
  lawyerRegisterValidator,
  updateProfileValidator,
} = require('../utils/validators');

// ========================
// PUBLIC ROUTES
// ========================

// POST /api/auth/register — Register new user
router.post('/register', registerValidator, handleValidationErrors, registerUser);

// POST /api/auth/register/lawyer — Register new lawyer
router.post('/register/lawyer', lawyerRegisterValidator, handleValidationErrors, registerLawyer);

// POST /api/auth/login — Login user or lawyer
router.post('/login', loginValidator, handleValidationErrors, loginUser);

// ========================
// PRIVATE ROUTES (Require JWT)
// ========================

// GET /api/auth/me — Get current user profile
router.get('/me', protect, getMe);

// PUT /api/auth/profile — Update user profile
router.put('/profile', protect, updateProfileValidator, handleValidationErrors, updateProfile);

// PUT /api/auth/lawyer-profile — Update lawyer-specific profile
router.put('/lawyer-profile', protect, authorize('lawyer'), updateLawyerProfile);

module.exports = router;