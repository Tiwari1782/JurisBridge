const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      default: null,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    publicId: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    // AI Analysis Results
    analysis: {
      summary: {
        type: String,
        default: '',
      },
      riskIndicators: [
        {
          clause: String,
          risk: String,         // 'low', 'medium', 'high'
          explanation: String,
        },
      ],
      clauseBreakdown: [
        {
          title: String,
          content: String,
          implication: String,
        },
      ],
      legalImplications: {
        type: String,
        default: '',
      },
      recommendation: {
        type: String,
        default: '',
      },
    },
    isAnalyzed: {
      type: Boolean,
      default: false,
    },
    analyzedBy: {
      type: String,
      enum: ['Claude', 'OpenAI', 'Gemini', 'Groq', 'Human Lawyer', ''],
      default: '',
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    extractedText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ caseId: 1 });

module.exports = mongoose.model('Document', DocumentSchema);