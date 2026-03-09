const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic:     { type: String, required: true },
  date:      { type: Date, required: true },
  time:      { type: String, required: true },
  duration:  { type: Number, enum: [30, 45, 60], default: 45 },
  status:    { type: String, enum: ['pending','upcoming','completed','rejected','cancelled'], default: 'pending' },
  notes:     { type: String, default: '' },
  rating:    { score: Number, comment: String, submittedAt: Date },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);