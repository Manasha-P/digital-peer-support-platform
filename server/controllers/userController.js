const User = require('../models/User');
const { NOTIFICATION_TYPES } = require('../utils/constants');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('notifications');
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ getProfile error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'userType', 'avatar'];
    const updates = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ updateProfile error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    
    // Sort notifications by date (newest first)
    const notifications = (user.notifications || []).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json({ success: true, notifications });
  } catch (err) {
    console.error('❌ getNotifications error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
exports.markNotificationAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const notification = user.notifications.id(req.params.id);
    if (notification) {
      notification.read = true;
      await user.save();
    }
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('❌ markNotificationAsRead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
exports.markNotificationsRead = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id, 
      { $set: { 'notifications.$[].read': true } }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('❌ markNotificationsRead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get available supporters (for users)
// @route   GET /api/users/supporters
// @access  Private
exports.getSupporters = async (req, res) => {
  try {
    const supporters = await User.find({ 
      role: 'supporter', 
      isApproved: true, 
      isActive: true 
    })
    .select('name bio specialty topics rating avatar experience qualifications')
    .sort({ 'rating.average': -1 });
    
    res.json({ success: true, supporters });
  } catch (err) {
    console.error('❌ getSupporters error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};