const mongoose = require('mongoose');
const { CASE_CATEGORIES, CASE_STATUS, TIMELINE_EVENTS } = require('../utils/constants');

const TimelineEntrySchema = new mongoose.Schema(
  {
    event: {
      type: String,
      enum: Object.values(TIMELINE_EVENTS),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const CaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Case description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: [...CASE_CATEGORIES],
      required: [true, 'Case category is required'],
    },
    status: {
      type: String,
      enum: Object.values(CASE_STATUS),
      default: CASE_STATUS.PENDING,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    // AI-related fields
    aiQueryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIQuery',
      default: null,
    },
    escalatedFromAI: {
      type: Boolean,
      default: false,
    },
    // Documents and evidence linked to this case
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    evidence: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    // Case timeline — chronological activity log
    timeline: [TimelineEntrySchema],

    // Lawyer response
    lawyerNotes: {
      type: String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    // Resolution details
    resolution: {
      type: String,
      default: '',
      maxlength: [3000, 'Resolution cannot exceed 3000 characters'],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
CaseSchema.index({ userId: 1, status: 1 });
CaseSchema.index({ lawyerId: 1, status: 1 });
CaseSchema.index({ category: 1 });
CaseSchema.index({ status: 1, createdAt: -1 });

// Auto-populate user and lawyer on find
CaseSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name email phone avatar',
  }).populate({
    path: 'lawyerId',
    select: 'userId specializations consultationFee rating experience',
  });
  next();
});

// Add timeline entry helper method
CaseSchema.methods.addTimelineEntry = function (event, description, performedBy, metadata = {}) {
  this.timeline.push({
    event,
    description,
    performedBy,
    metadata,
  });
  return this.save();
};

module.exports = mongoose.model('Case', CaseSchema);