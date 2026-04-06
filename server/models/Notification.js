const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['session_request', 'session_update', 'extension_response', 'feedback_request'], 
    required: true 
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Can be session ID
  metadata: { type: mongoose.Schema.Types.Mixed }, // For QR code URL, extension minutes, etc.
  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient querying by user
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
