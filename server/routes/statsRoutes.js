const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Case = require('../models/Case');
const AIQuery = require('../models/AIQuery');
const Document = require('../models/Document');
const Evidence = require('../models/Evidence');
const LegalNotice = require('../models/LegalNotice');
const ChatMessage = require('../models/ChatMessage');
const Lawyer = require('../models/Lawyer');

// @desc    Get complete dashboard stats for current user
// @route   GET /api/stats/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    let stats = {};

    if (req.user.role === 'user') {
      // User dashboard stats
      const totalCases = await Case.countDocuments({ userId });
      const activeCases = await Case.countDocuments({ userId, status: 'active' });
      const pendingCases = await Case.countDocuments({ userId, status: 'pending' });
      const resolvedCases = await Case.countDocuments({ userId, status: 'resolved' });
      const totalAIQueries = await AIQuery.countDocuments({ userId });
      const totalDocuments = await Document.countDocuments({ userId });
      const totalNotices = await LegalNotice.countDocuments({ userId });

      // Recent activity
      const recentCases = await Case.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status category updatedAt');

      const recentQueries = await AIQuery.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('query provider confidence createdAt');

      stats = {
        overview: {
          totalCases,
          activeCases,
          pendingCases,
          resolvedCases,
          totalAIQueries,
          totalDocuments,
          totalNotices,
        },
        recentCases,
        recentQueries,
      };
    } else if (req.user.role === 'lawyer') {
      // Lawyer dashboard stats
      const lawyer = await Lawyer.findOne({ userId });

      if (lawyer) {
        const totalCases = await Case.countDocuments({ lawyerId: lawyer._id });
        const activeCases = await Case.countDocuments({ lawyerId: lawyer._id, status: 'active' });
        const pendingRequests = await Case.countDocuments({ lawyerId: lawyer._id, status: 'pending' });
        const resolvedCases = await Case.countDocuments({ lawyerId: lawyer._id, status: 'resolved' });
        const totalMessages = await ChatMessage.countDocuments({ senderId: userId });
        const unreadMessages = await ChatMessage.countDocuments({
          caseId: { $in: (await Case.find({ lawyerId: lawyer._id }).select('_id')).map((c) => c._id) },
          senderId: { $ne: userId },
          isRead: false,
        });

        const recentCases = await Case.find({ lawyerId: lawyer._id })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select('title status category updatedAt userId');

        stats = {
          overview: {
            totalCases,
            activeCases,
            pendingRequests,
            resolvedCases,
            totalMessages,
            unreadMessages,
            rating: lawyer.rating,
            totalReviews: lawyer.totalReviews,
          },
          recentCases,
        };
      }
    }

    res.status(200).json({
      success: true,
      role: req.user.role,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message,
    });
  }
});

module.exports = router;