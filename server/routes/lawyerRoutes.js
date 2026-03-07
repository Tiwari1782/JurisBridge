const express = require('express');
const router = express.Router();

// Controller
const {
  getAllLawyers,
  getLawyerById,
  getNearbyLawyers,
  getLawyersBySpecialization,
  getSpecializations,
  submitReview,
  getLawyerReviews,
  deleteReview,
  verifyLawyer,
} = require('../controllers/lawyerController');

// Middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// ========================
// PUBLIC ROUTES
// ========================

// GET /api/lawyers — Get all verified lawyers (with filters)
router.get('/', getAllLawyers);

// GET /api/lawyers/nearby — Find nearby lawyers (geospatial)
router.get('/nearby', getNearbyLawyers);

// GET /api/lawyers/specializations/list — Get all specializations with counts
router.get('/specializations/list', getSpecializations);

// GET /api/lawyers/specialization/:type — Get lawyers by specialization
router.get('/specialization/:type', getLawyersBySpecialization);

// GET /api/lawyers/:id — Get single lawyer profile
router.get('/:id', getLawyerById);

// GET /api/lawyers/:id/reviews — Get reviews for a lawyer
router.get('/:id/reviews', getLawyerReviews);

// ========================
// PRIVATE ROUTES
// ========================

// POST /api/lawyers/:id/reviews — Submit a review (Users only)
router.post('/:id/reviews', protect, authorize('user'), submitReview);

// DELETE /api/lawyers/:id/reviews — Delete own review
router.delete('/:id/reviews', protect, deleteReview);

// PUT /api/lawyers/:id/verify — Verify a lawyer (testing/admin)
router.put('/:id/verify', protect, verifyLawyer);

module.exports = router;