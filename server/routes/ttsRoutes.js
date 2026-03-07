const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { AppError } = require('../middleware/errorHandler');
const { synthesizeSpeech } = require('../services/ttsService');

// All TTS routes require authentication
router.use(protect);

// @desc    Convert text to speech
// @route   POST /api/tts/synthesize
// @access  Private
router.post('/synthesize', async (req, res, next) => {
  try {
    const { text, language, premium } = req.body;

    if (!text || text.trim().length === 0) {
      return next(new AppError('Text is required for speech synthesis', 400));
    }

    if (text.length > 5000) {
      return next(new AppError('Text is too long. Maximum 5000 characters for TTS.', 400));
    }

    const userLanguage = language || req.user.language || 'en';
    const preferPremium = premium === true;

    const result = await synthesizeSpeech(text, userLanguage, preferPremium);

    // If audio content is available, send as audio
    if (result.audioContent) {
      res.status(200).json({
        success: true,
        data: {
          audioContent: result.audioContent, // base64 encoded
          format: result.format,
          provider: result.provider,
        },
      });
    } else {
      // Browser fallback — frontend will handle TTS
      res.status(200).json({
        success: true,
        data: {
          audioContent: null,
          text: result.text,
          format: 'browser',
          provider: result.provider,
          instruction: result.instruction,
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get available TTS providers
// @route   GET /api/tts/providers
// @access  Private
router.get('/providers', (req, res) => {
  const providers = [];

  if (process.env.GOOGLE_TTS_API_KEY && process.env.GOOGLE_TTS_API_KEY !== 'placeholder') {
    providers.push({
      name: 'Google TTS',
      status: 'active',
      languages: ['en', 'hi'],
      quality: 'standard',
    });
  }

  if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY !== 'placeholder') {
    providers.push({
      name: 'ElevenLabs',
      status: 'active',
      languages: ['en', 'hi'],
      quality: 'premium',
    });
  }

  // Browser fallback is always available
  providers.push({
    name: 'Browser Web Speech API',
    status: 'active',
    languages: ['en', 'hi'],
    quality: 'basic',
    note: 'Always available as fallback — runs on client side',
  });

  res.status(200).json({
    success: true,
    count: providers.length,
    data: providers,
  });
});

module.exports = router;