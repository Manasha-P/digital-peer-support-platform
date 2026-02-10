const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  peerSupporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  topic: {
    type: String,
    required: true
  },
  notes: String,
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);