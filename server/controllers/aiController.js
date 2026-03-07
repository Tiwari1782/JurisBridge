const AIQuery = require('../models/AIQuery.js');
const { getAIResponse } = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');
const { getPagination, truncateText } = require('../utils/helpers');
const { sendEmail } = require('../config/email');
const { lawyerAIEscalationEmail } = require('../utils/emailTemplates');
const Lawyer = require('../models/Lawyer');

// @desc    Send a query to JurisPilot AI
// @route   POST /api/ai/query
// @access  Private
const askJurisPilot = async (req, res, next) => {
  try {
    const { query, language, source } = req.body;

    if (!query || query.trim().length === 0) {
      return next(new AppError('Please provide a legal question', 400));
    }

    if (query.length > 5000) {
      return next(
        new AppError('Query is too long. Maximum 5000 characters allowed.', 400)
      );
    }

    const userLanguage = language || req.user.language || 'en';
    const querySource = source || 'chat_page';

    console.log(`\n🤖 JurisPilot Query from ${req.user.name}:`);
    console.log(`📝 "${truncateText(query, 100)}"`);
    console.log(`🌐 Language: ${userLanguage}`);
    console.log(`📍 Source: ${querySource}`);

    // Get AI response
    const aiResult = await getAIResponse(query, userLanguage);

    // Save query
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
      source: querySource,
    });

    // Escalate to lawyers if needed
    if (aiResult.escalated) {
      await notifyLawyersForEscalation(
        aiResult.category,
        query,
        aiQuery._id
      );
    }

    res.status(200).json({
      success: true,
      data: {
        id: aiQuery._id,
        query: aiQuery.query,
        response: aiResult.response,
        provider: aiResult.provider,
        confidence: aiResult.confidence,
        category: aiResult.category,
        escalated: aiResult.escalated,
        language: userLanguage,
        source: querySource,
        createdAt: aiQuery.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get user's AI chat history
const getAIHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { category, source } = req.query;

    const filter = { userId: req.user.id };

    if (category) filter.category = category;
    if (source) filter.source = source;

    const total = await AIQuery.countDocuments(filter);

    const queries = await AIQuery.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.status(200).json({
      success: true,
      count: queries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: queries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single query
const getAIQueryById = async (req, res, next) => {
  try {
    const query = await AIQuery.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!query) {
      return next(new AppError('Query not found', 404));
    }

    res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete query
const deleteAIQuery = async (req, res, next) => {
  try {
    const query = await AIQuery.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!query) {
      return next(new AppError('Query not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Query deleted from history',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Submit feedback
const submitFeedback = async (req, res, next) => {
  try {
    const { helpful, comment } = req.body;

    const query = await AIQuery.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        feedback: {
          helpful,
          comment: comment || '',
        },
      },
      { new: true }
    );

    if (!query) {
      return next(new AppError('Query not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: query,
    });
  } catch (error) {
    next(error);
  }
};

// @desc AI stats
const getAIStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalQueries = await AIQuery.countDocuments({ userId });
    const escalatedQueries = await AIQuery.countDocuments({
      userId,
      escalated: true,
    });

    const categoryStats = await AIQuery.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const providerStats = await AIQuery.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$provider', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalQueries,
        escalatedQueries,
        resolvedByAI: totalQueries - escalatedQueries,
        categoryBreakdown: categoryStats,
        providerBreakdown: providerStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
 Notify lawyers when AI escalates
*/
const notifyLawyersForEscalation = async (category, query, queryId) => {
  try {
    const categoryToSpecialization = {
      'Property Dispute': 'Property Law',
      'Family Matter': 'Family Law',
      'Criminal Case': 'Criminal Law',
      'Employment Issue': 'Employment Law',
      'Cybercrime': 'Cyber Law',
      'Consumer Complaint': 'Consumer Rights',
      'Business Contract': 'Corporate Law',
      'Intellectual Property': 'Intellectual Property',
      'Tax Dispute': 'Tax Law',
      'Immigration': 'Immigration Law',
      'Civil Rights': 'Constitutional Law',
    };

    const specialization = categoryToSpecialization[category] || null;

    const filter = { isAvailable: true };

    if (specialization) {
      filter.specializations = { $in: [specialization] };
    }

    const lawyers = await Lawyer.find(filter).limit(5);

    for (const lawyer of lawyers) {
      if (lawyer.userId && lawyer.userId.email) {
        try {
          const emailContent = lawyerAIEscalationEmail(lawyer.userId.name, {
            category,
            preview: truncateText(query, 200),
            confidence: 'Below threshold',
          });

          await sendEmail({
            to: lawyer.userId.email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
          });

          console.log(`📧 Escalation email sent to: ${lawyer.userId.name}`);
        } catch (err) {
          console.error(`⚠️ Failed to email ${lawyer.userId.name}:`, err.message);
        }
      }
    }
  } catch (error) {
    console.error('⚠️ Lawyer notification failed:', error.message);
  }
};

module.exports = {
  askJurisPilot,
  getAIHistory,
  getAIQueryById,
  deleteAIQuery,
  submitFeedback,
  getAIStats,
};