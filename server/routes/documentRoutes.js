const express = require('express');
const router = express.Router();

// Controller
const {
  uploadAndAnalyze,
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  reAnalyzeDocument,
  deleteDocument,
} = require('../controllers/documentController');

// Middleware
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// ========================
// DOCUMENT ROUTES
// ========================

// POST /api/documents/analyze — Upload + AI analysis
router.post('/analyze', upload.single('document'), uploadAndAnalyze);

// POST /api/documents/upload — Upload only (no analysis)
router.post('/upload', upload.single('document'), uploadDocument);

// GET /api/documents — Get all my documents
router.get('/', getMyDocuments);

// GET /api/documents/:id — Get single document with analysis
router.get('/:id', getDocumentById);

// PUT /api/documents/:id/analyze — Re-analyze existing document
router.put('/:id/analyze', reAnalyzeDocument);

// DELETE /api/documents/:id — Delete a document
router.delete('/:id', deleteDocument);

module.exports = router;