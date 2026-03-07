const express = require('express');
const router = express.Router();

// Controller
const {
  uploadEvidence,
  getCaseEvidence,
  getEvidenceById,
  verifyEvidence,
  deleteEvidence,
} = require('../controllers/evidenceController');

// Middleware
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// ========================
// EVIDENCE ROUTES
// ========================

// POST /api/evidence/upload — Upload evidence to a case
router.post('/upload', upload.single('evidence'), uploadEvidence);

// GET /api/evidence/case/:caseId — Get all evidence for a case
router.get('/case/:caseId', getCaseEvidence);

// GET /api/evidence/:id — Get single evidence item
router.get('/:id', getEvidenceById);

// GET /api/evidence/:id/verify — Verify evidence integrity (SHA256)
router.get('/:id/verify', verifyEvidence);

// DELETE /api/evidence/:id — Delete evidence
router.delete('/:id', deleteEvidence);

module.exports = router;