const mongoose = require('mongoose');

const LegalNoticeSchema = new mongoose.Schema(
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
    // Sender Details
    sender: {
      name: {
        type: String,
        required: [true, 'Sender name is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Sender address is required'],
      },
      email: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
    },
    // Recipient Details
    recipient: {
      name: {
        type: String,
        required: [true, 'Recipient name is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Recipient address is required'],
      },
      email: {
        type: String,
        default: '',
      },
      phone: {
        type: String,
        default: '',
      },
    },
    // Notice Content
    subject: {
      type: String,
      required: [true, 'Notice subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    incidentDescription: {
      type: String,
      required: [true, 'Incident description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    legalClaim: {
      type: String,
      required: [true, 'Legal claim is required'],
      maxlength: [2000, 'Legal claim cannot exceed 2000 characters'],
    },
    desiredResolution: {
      type: String,
      required: [true, 'Desired resolution is required'],
      maxlength: [1000, 'Resolution cannot exceed 1000 characters'],
    },
    deadline: {
      type: Number, // days to respond
      required: [true, 'Response deadline is required'],
      min: [7, 'Minimum deadline is 7 days'],
      max: [90, 'Maximum deadline is 90 days'],
    },
    // AI-Generated Notice
    generatedNotice: {
      type: String,
      default: '',
    },
    generatedBy: {
      type: String,
      enum: ['Claude', 'OpenAI', 'Gemini', 'Groq', 'Human Lawyer', ''],
      default: '',
    },
    // Notice metadata
    category: {
      type: String,
      default: 'Other',
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    status: {
      type: String,
      enum: ['draft', 'generated', 'reviewed', 'sent'],
      default: 'draft',
    },
    // Lawyer review
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer',
      default: null,
    },
    lawyerComments: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LegalNoticeSchema.index({ userId: 1, createdAt: -1 });
LegalNoticeSchema.index({ status: 1 });

module.exports = mongoose.model('LegalNotice', LegalNoticeSchema);