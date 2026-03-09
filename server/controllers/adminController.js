const User = require('../models/User');
const Session = require('../models/Session');
const { NOTIFICATION_TYPES, ROLES, PAGINATION } = require('../utils/constants');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalSupporters, pendingApprovals, totalSessions] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'supporter', isApproved: true }),
      User.countDocuments({ role: 'supporter', isApproved: false }),
      Session.countDocuments(),
    ]);
    
    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [newUsersToday, newSessionsToday] = await Promise.all([
      User.countDocuments({ role: 'user', createdAt: { $gte: today } }),
      Session.countDocuments({ createdAt: { $gte: today } })
    ]);
    
    // Calculate average rating
    const sessionsWithRatings = await Session.find({ 'rating.score': { $exists: true } });
    const avgRating = sessionsWithRatings.length > 0
      ? (sessionsWithRatings.reduce((sum, s) => sum + (s.rating?.score || 0), 0) / sessionsWithRatings.length).toFixed(1)
      : 4.8;
    
    res.json({ 
      success: true, 
      stats: { 
        totalUsers, 
        totalSupporters, 
        pendingApprovals, 
        totalSessions,
        newUsersToday,
        newSessionsToday,
        avgRating: parseFloat(avgRating),
        activeUsers: Math.floor(totalUsers * 0.85), // 85% active (demo)
        completionRate: 94,
        supporterAvailability: 76,
        responseRate: 88
      } 
    });
  } catch (err) {
    console.error('❌ getStats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get pending supporter applications
// @route   GET /api/admin/supporters/pending
// @access  Private/Admin
exports.getPendingSupporters = async (req, res) => {
  try {
    const supporters = await User.find({ 
      role: 'supporter', 
      isApproved: false, 
      isActive: true 
    })
    .select('name email bio specialty topics createdAt experience qualifications userType')
    .sort({ createdAt: -1 });
    
    res.json({ success: true, supporters });
  } catch (err) {
    console.error('❌ getPendingSupporters error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve a supporter
// @route   PUT /api/admin/supporters/:id/approve
// @access  Private/Admin
exports.approveSupporter = async (req, res) => {
  try {
    const supporter = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'supporter' },
      { isApproved: true },
      { new: true }
    );
    
    if (!supporter) {
      return res.status(404).json({ success: false, message: 'Supporter not found' });
    }
    
    // Send notification to supporter
    await supporter.addNotification(
      NOTIFICATION_TYPES.APPROVAL,
      '🎉 Your supporter account has been approved! You can now log in and start accepting sessions.',
      supporter._id
    );
    
    res.json({ 
      success: true, 
      message: 'Supporter approved successfully',
      supporter 
    });
  } catch (err) {
    console.error('❌ approveSupporter error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject a supporter
// @route   PUT /api/admin/supporters/:id/reject
// @access  Private/Admin
exports.rejectSupporter = async (req, res) => {
  try {
    const supporter = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'supporter' },
      { isActive: false },
      { new: true }
    );
    
    if (!supporter) {
      return res.status(404).json({ success: false, message: 'Supporter not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Supporter rejected' 
    });
  } catch (err) {
    console.error('❌ rejectSupporter error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users with pagination and search
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role isApproved isActive userType createdAt')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);
    
    res.json({ 
      success: true, 
      users, 
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('❌ getAllUsers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private/Admin
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin users' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('❌ toggleUserActive error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all sessions for admin
// @route   GET /api/admin/sessions
// @access  Private/Admin
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('user', 'name email')
      .populate('supporter', 'name email specialty')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({ success: true, sessions });
  } catch (err) {
    console.error('❌ getAllSessions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get recent activities for dashboard
// @route   GET /api/admin/activities
// @access  Private/Admin
exports.getRecentActivities = async (req, res) => {
  try {
    // Get recent sessions and user registrations
    const [recentSessions, recentUsers, recentSupporters] = await Promise.all([
      Session.find()
        .populate('user', 'name')
        .populate('supporter', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(5),
      User.find({ role: 'supporter', isApproved: false })
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const activities = [];

    // Add supporter application activities
    recentSupporters.forEach(supporter => {
      activities.push({
        id: `supporter_${supporter._id}`,
        icon: 'user-add',
        title: 'New supporter application',
        description: `${supporter.name} applied to become a supporter`,
        time: formatTimeAgo(supporter.createdAt),
        color: '#fef3c7'
      });
    });

    // Add session activities
    recentSessions.forEach(session => {
      if (session.status === 'completed') {
        activities.push({
          id: `session_${session._id}`,
          icon: 'completed',
          title: 'Session completed',
          description: `${session.user?.name || 'A user'} completed a session with ${session.supporter?.name || 'a supporter'}`,
          time: formatTimeAgo(session.updatedAt || session.createdAt),
          color: '#dbeafe'
        });
      }
    });

    // Add user registration activities
    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user._id}`,
        icon: 'user',
        title: 'New user registered',
        description: `${user.name} joined as a user`,
        time: formatTimeAgo(user.createdAt),
        color: '#dcfce7'
      });
    });

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, activities: activities.slice(0, 10) });
  } catch (err) {
    console.error('❌ getRecentActivities error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get session statistics
// @route   GET /api/admin/sessions/stats
// @access  Private/Admin
exports.getSessionStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch(period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }
    
    const sessions = await Session.find({ 
      createdAt: { $gte: startDate } 
    }).populate('user supporter', 'name');
    
    const stats = {
      total: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length,
      pending: sessions.filter(s => s.status === 'pending').length,
      upcoming: sessions.filter(s => s.status === 'upcoming').length,
      cancelled: sessions.filter(s => s.status === 'cancelled').length,
      avgDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length || 0,
      byTopic: {},
      byDay: {}
    };
    
    // Group by topic
    sessions.forEach(s => {
      stats.byTopic[s.topic] = (stats.byTopic[s.topic] || 0) + 1;
    });
    
    // Group by day
    sessions.forEach(s => {
      const day = new Date(s.createdAt).toLocaleDateString();
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });
    
    res.json({ success: true, stats });
  } catch (err) {
    console.error('❌ getSessionStats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    // You can store settings in a separate collection or in memory
    // For now, return default settings
    res.json({ 
      success: true, 
      settings: {
        platformName: 'PeerBridge',
        supportEmail: 'support@peerbridge.com',
        maxSessionsPerDay: 10,
        allowNewRegistrations: true,
        requireSupporterApproval: true,
        enableChat: true,
        emailNotifications: true,
        smsReminders: false,
        sessionReminders: true,
        maintenanceMode: false
      }
    });
  } catch (err) {
    console.error('❌ getSettings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    // Here you would save settings to database
    // For now, just return success
    res.json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings: req.body
    });
  } catch (err) {
    console.error('❌ updateSettings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 60000); // minutes
  
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)} days ago`;
  return new Date(date).toLocaleDateString();
}