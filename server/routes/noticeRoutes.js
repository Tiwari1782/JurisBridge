const express = require('express');
const router = express.Router();

// Controller
const {
  createNotice,
  getMyNotices,
  getNoticeById,
  regenerateNotice,
  updateNoticeStatus,
  deleteNotice,
} = require('../controllers/noticeController');

// Middleware
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// ========================
// LEGAL NOTICE ROUTES
// ========================

// POST /api/notices/generate — Generate a new legal notice
router.post('/generate', createNotice);

// GET /api/notices — Get all my notices
router.get('/', getMyNotices);

// GET /api/notices/:id — Get single notice with full text
router.get('/:id', getNoticeById);

// PUT /api/notices/:id/regenerate — Regenerate notice
router.put('/:id/regenerate', regenerateNotice);

// PUT /api/notices/:id/status — Update notice status
router.put('/:id/status', updateNoticeStatus);

// DELETE /api/notices/:id — Delete a notice
router.delete('/:id', deleteNotice);

module.exports = router;