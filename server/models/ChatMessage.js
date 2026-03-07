const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case ID is required'],
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    senderRole: {
      type: String,
      enum: ['user', 'lawyer'],
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      default: '',
    },
    attachments: [
      {
        url: String,         // Cloudinary URL
        publicId: String,    // Cloudinary public ID
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
    ],
    messageType: {
      type: String,
      enum: ['text', 'file', 'system', 'ai_suggestion'],
      default: 'text',
    },
    readAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ChatMessageSchema.index({ caseId: 1, createdAt: 1 });
ChatMessageSchema.index({ senderId: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);