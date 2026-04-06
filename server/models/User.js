const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const notificationSchema = new mongoose.Schema({
  type: String, message: String, read: { type: Boolean, default: false },
  relatedId: mongoose.Schema.Types.ObjectId, createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, minlength: 6, select: false },
  role:       { type: String, enum: ['user','supporter','admin'], default: 'user' },
  userType:   { type: String },
  isApproved: { type: Boolean, default: false },
  bio:        { type: String, default: '' },
  specialty:  { type: String, default: '' },
  topics:     [String],
  rating:     { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  googleId:   { type: String },
  avatar:     { type: String, default: '' },
  notifications: [notificationSchema],
  isActive:   { type: Boolean, default: true },
  
  // WhatsApp Presence Tracking
  isOnline:   { type: Boolean, default: false },
  lastSeen:   { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.addNotification = async function (type, message, relatedId = null) {
  this.notifications.unshift({ type, message, relatedId });
  if (this.notifications.length > 50) this.notifications = this.notifications.slice(0, 50);
  await this.save();
};

module.exports = mongoose.model('User', userSchema);