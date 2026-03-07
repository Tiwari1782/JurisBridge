const mongoose = require('mongoose');

const aiQuerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    query: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    response: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      enum: [
        'groq',
        'gemini',
        'openai',
        'claude',
        'fallback',
        'human_lawyer',
      ],
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    category: {
      type: String,
    },

    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },

    source: {
      type: String,
      enum: [
        'chat_page',
        'mini_widget',
        'quick_ask',
        'voice_input',
        'case_escalation',
      ],
      default: 'chat_page',
    },

    escalated: {
      type: Boolean,
      default: false,
    },

    escalationReason: {
      type: String,
      default: '',
    },

    feedback: {
      helpful: {
        type: Boolean,
      },
      comment: {
        type: String,
        default: '',
      },
    },

    responseTime: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

/*
 Normalize provider before validation
 Ensures all values match enum
*/
aiQuerySchema.pre('validate', function (next) {
  if (this.provider) {
    this.provider = this.provider.toLowerCase();
  }
  next();
});

/*
 Useful index for fast user history queries
*/
aiQuerySchema.index({ userId: 1, createdAt: -1 });

const AIQuery = mongoose.model('AIQuery', aiQuerySchema);

module.exports = AIQuery;