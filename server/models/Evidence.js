const mongoose = require('mongoose');
const { EVIDENCE_TYPES } = require('../utils/constants');

const EvidenceSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case ID is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    evidenceType: {
      type: String,
      enum: Object.values(EVIDENCE_TYPES),
      required: true,
    },
    // SHA256 hash for integrity verification
    fileHash: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    // Integrity verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EvidenceSchema.index({ caseId: 1, createdAt: -1 });
EvidenceSchema.index({ uploadedBy: 1 });
EvidenceSchema.index({ fileHash: 1 });

module.exports = mongoose.model('Evidence', EvidenceSchema);