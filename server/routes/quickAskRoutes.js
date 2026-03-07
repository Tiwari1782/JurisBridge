const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../services/aiService');
const AIQuery = require('../models/AIQuery');
const { protect } = require('../middleware/authMiddleware');
const { AppError } = require('../middleware/errorHandler');

// @desc    Quick ask JurisPilot (from mini widget on any page)
// @route   POST /api/ai/quick-ask
// @access  Private
// This is a lightweight endpoint for the floating JurisPilot mini icon
router.post('/quick-ask', protect, async (req, res, next) => {
  try {
    const { query, language } = req.body;

    if (!query || query.trim().length === 0) {
      return next(new AppError('Please type a question for JurisPilot', 400));
    }

    // Limit quick-ask to shorter queries
    if (query.length > 500) {
      return next(
        new AppError(
          'Quick questions are limited to 500 characters. Use the full JurisPilot chat for longer queries.',
          400
        )
      );
    }

    const userLanguage = language || req.user.language || 'en';

    // Get AI response
    const aiResult = await getAIResponse(query, userLanguage);

    // Save to history with 'mini_widget' source
    const aiQuery = await AIQuery.create({
      userId: req.user.id,
      query: query.trim(),
      response: aiResult.response,
      provider: aiResult.provider,
      confidence: aiResult.confidence,
      category: aiResult.category,
      language: userLanguage,
      escalated: aiResult.escalated,
      escalationReason: aiResult.escalationReason || '',
      source: 'mini_widget',
    });

    res.status(200).json({
      success: true,
      data: {
        id: aiQuery._id,
        response: aiResult.response,
        provider: aiResult.provider,
        confidence: aiResult.confidence,
        escalated: aiResult.escalated,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;