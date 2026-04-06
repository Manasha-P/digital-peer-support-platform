const mongoose = require('mongoose');

// Schema for session extensions
const extensionSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  duration: { type: Number, required: true }, // 15, 30, 45 minutes
  requestedAt: { type: Date, default: Date.now },
  approvedAt: Date,
  rejectedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { _id: true });

const sessionSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:     { type: String, required: true },
  date:      { type: Date, required: true },
  time:      { type: String, required: true },
  duration:  { type: Number, enum: [30, 45, 60], default: 45 },
  status:    { type: String, enum: ['pending','upcoming','live','ended','completed','rejected','cancelled'], default: 'pending' },
  notes:     { type: String, default: '' },
  
  // Session extension tracking
  originalEndTime: { type: Date },  // Original session end time
  currentEndTime: { type: Date },   // Current end time (after extensions)
  extensions: [extensionSchema],     // Array of all extensions
  totalExtendedMinutes: { type: Number, default: 0 },
  
  // Live session tracking
  liveStartedAt: { type: Date },     // When session actually started (user joined)
  lastActivityAt: { type: Date },    // Last activity during live session
  extendedEndRequested: { type: Boolean, default: false }, // Flag for pending extension request
  
  rating:    { score: Number, comment: String, submittedAt: Date },
  
  // QR Code for feedback
  feedbackQRCode: { type: String },  // QR code data/URL
  feedbackSubmitted: { type: Boolean, default: false },
  feedbackToken: { type: String },    // Unique token for feedback link
  feedbackLink: { type: String },     // URL for feedback page
  feedbackViewed: { type: Boolean, default: false }
}, { timestamps: true });

// Add indexes for better query performance
sessionSchema.index({ user: 1, status: 1 });
sessionSchema.index({ supporter: 1, status: 1 });
sessionSchema.index({ currentEndTime: 1 });
sessionSchema.index({ feedbackToken: 1 });

// Calculate if session is currently live
sessionSchema.virtual('isLiveNow').get(function() {
  if (this.status !== 'live') return false;
  const now = new Date();
  return now >= this.liveStartedAt && now <= this.currentEndTime;
});

// Virtual for remaining minutes
sessionSchema.virtual('remainingMinutes').get(function() {
  return this.getRemainingMinutes();
});

// Method to calculate remaining time
sessionSchema.methods.getRemainingMinutes = function() {
  if (this.status !== 'live' || !this.currentEndTime) return 0;
  const now = new Date();
  const remaining = Math.max(0, Math.floor((this.currentEndTime - now) / 60000));
  return remaining;
};

// Check if session needs extension prompt (5 minutes remaining)
sessionSchema.virtual('needsExtensionPrompt').get(function() {
  if (this.status !== 'live') return false;
  return this.getRemainingMinutes() <= 5 && !this.extendedEndRequested;
});

// Calculate total session duration (original + extensions)
sessionSchema.virtual('totalDuration').get(function() {
  return this.duration + this.totalExtendedMinutes;
});

module.exports = mongoose.model('Session', sessionSchema);