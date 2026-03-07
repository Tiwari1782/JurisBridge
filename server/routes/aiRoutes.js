const express = require('express');
const router = express.Router();

// Controller
const {
  askJurisPilot,
  getAIHistory,
  getAIQueryById,
  deleteAIQuery,
  submitFeedback,
  getAIStats,
} = require('../controllers/aiController');

// Middleware
const { protect } = require('../middleware/authMiddleware');

// Quick Ask (Mini Widget)
const quickAskRoutes = require('./quickAskRoutes');

// All AI routes require authentication
router.use(protect);

// ========================
// JURISPILOT AI ROUTES
// ========================

// POST /api/ai/query — Ask JurisPilot a legal question (full chat page)
router.post('/query', askJurisPilot);

// POST /api/ai/quick-ask — Quick ask from mini widget (any page)
router.use('/', quickAskRoutes);

// GET /api/ai/history — Get user's AI chat history
router.get('/history', getAIHistory);

// GET /api/ai/stats — Get user's AI usage statistics
router.get('/stats', getAIStats);

// GET /api/ai/history/:id — Get a single AI query
router.get('/history/:id', getAIQueryById);

// DELETE /api/ai/history/:id — Delete an AI query from history
router.delete('/history/:id', deleteAIQuery);

// PUT /api/ai/feedback/:id — Submit feedback on AI response
router.put('/feedback/:id', submitFeedback);

module.exports = router;