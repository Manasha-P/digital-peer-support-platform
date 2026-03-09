const Session = require('../models/Session');
const User = require('../models/User');
const { NOTIFICATION_TYPES } = require('../utils/constants');

// @desc    Get user's sessions (for both user and supporter)
// @route   GET /api/sessions
// @access  Private
exports.getMySessions = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'user') {
      query.user = req.user._id;
    } else if (req.user.role === 'supporter') {
      query.supporter = req.user._id;
    }

    const sessions = await Session.find(query)
      .populate('user', 'name email avatar userType')
      .populate('supporter', 'name email avatar specialty rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, sessions });
  } catch (err) {
    console.error('❌ getMySessions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get available supporters (for users)
// @route   GET /api/sessions/supporters
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

// @desc    Get available supporters with filters (for users)
// @route   GET /api/sessions/available-supporters
// @access  Private
exports.getAvailableSupporters = async (req, res) => {
  try {
    const { topic, search } = req.query;
    
    let query = { 
      role: 'supporter', 
      isApproved: true, 
      isActive: true 
    };
    
    // Filter by topic if provided
    if (topic) {
      query.topics = topic;
    }
    
    // Search by name or specialty
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { topics: { $regex: search, $options: 'i' } }
      ];
    }
    
    const supporters = await User.find(query)
      .select('name bio specialty topics rating avatar experience qualifications')
      .sort({ 'rating.average': -1 });

    res.json({ success: true, supporters });
  } catch (err) {
    console.error('❌ getAvailableSupporters error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get pending sessions for supporter
// @route   GET /api/sessions/pending
// @access  Private (Supporter only)
exports.getPendingSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ 
      supporter: req.user._id, 
      status: 'pending' 
    })
    .populate('user', 'name email userType avatar')
    .sort({ createdAt: -1 });

    res.json({ success: true, sessions });
  } catch (err) {
    console.error('❌ getPendingSessions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Book a new session
// @route   POST /api/sessions
// @access  Private (User only)
exports.bookSession = async (req, res) => {
  try {
    const { supporterId, topic, date, time, duration, notes } = req.body;

    if (!supporterId || !topic || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Supporter ID, topic, date and time are required' 
      });
    }

    const supporter = await User.findOne({ 
      _id: supporterId, 
      role: 'supporter', 
      isApproved: true,
      isActive: true 
    });

    if (!supporter) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supporter not found or not available' 
      });
    }

    const session = await Session.create({
      user: req.user._id,
      supporter: supporterId,
      topic,
      date: new Date(date),
      time,
      duration: Number(duration) || 45,
      notes: notes || '',
      status: 'pending'
    });

    // Notify supporter
    await supporter.addNotification(
      NOTIFICATION_TYPES.SESSION_REQUEST,
      `${req.user.name} requested a session on "${topic}"`,
      session._id
    );

    const populated = await Session.findById(session._id)
      .populate('user', 'name email avatar')
      .populate('supporter', 'name email avatar specialty');

    res.status(201).json({ success: true, session: populated });
  } catch (err) {
    console.error('❌ bookSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Accept a session request
// @route   PUT /api/sessions/:id/accept
// @access  Private (Supporter only)
exports.acceptSession = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      supporter: req.user._id,
      status: 'pending'
    }).populate('user');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    session.status = 'upcoming';
    await session.save();

    // Notify user
    await session.user.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `Your session request has been accepted by ${req.user.name}`,
      session._id
    );

    res.json({ success: true, session });
  } catch (err) {
    console.error('❌ acceptSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject a session request
// @route   PUT /api/sessions/:id/reject
// @access  Private (Supporter only)
exports.rejectSession = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      supporter: req.user._id,
      status: 'pending'
    }).populate('user');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    session.status = 'rejected';
    await session.save();

    // Notify user
    await session.user.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `Your session request was declined by ${req.user.name}`,
      session._id
    );

    res.json({ success: true, session });
  } catch (err) {
    console.error('❌ rejectSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark session as complete
// @route   PUT /api/sessions/:id/complete
// @access  Private (Supporter only)
exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      supporter: req.user._id,
      status: 'upcoming'
    }).populate('user');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    session.status = 'completed';
    await session.save();

    // Notify user to rate
    await session.user.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `Your session with ${req.user.name} is complete. Please rate your experience.`,
      session._id
    );

    res.json({ success: true, session });
  } catch (err) {
    console.error('❌ completeSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update session status (general purpose)
// @route   PUT /api/sessions/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id)
      .populate('user', 'name')
      .populate('supporter', 'name');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Check authorization
    const isSupporter = session.supporter._id.toString() === req.user._id.toString();
    const isUser = session.user._id.toString() === req.user._id.toString();

    if (!isSupporter && !isUser && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    session.status = status;
    await session.save();

    // Notify the other party
    if (isSupporter) {
      await session.user.addNotification(
        NOTIFICATION_TYPES.SESSION_UPDATE,
        status === 'upcoming' 
          ? `Your session was accepted by ${session.supporter.name} ✅`
          : `Your session was rejected by ${session.supporter.name}`,
        session._id
      );
    }

    res.json({ success: true, session });
  } catch (err) {
    console.error('❌ updateStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Rate a completed session
// @route   POST /api/sessions/:id/rate
// @access  Private (User only)
exports.rateSession = async (req, res) => {
  try {
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Score must be between 1 and 5' 
      });
    }

    const session = await Session.findOne({ 
      _id: req.params.id, 
      user: req.user._id, 
      status: 'completed' 
    }).populate('supporter');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Completed session not found' 
      });
    }

    if (session.rating?.score) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session already rated' 
      });
    }

    session.rating = { 
      score, 
      comment: comment || '', 
      submittedAt: new Date() 
    };
    await session.save();

    // Update supporter's average rating
    const supporter = await User.findById(session.supporter._id);
    const allSessions = await Session.find({ 
      supporter: supporter._id, 
      status: 'completed',
      'rating.score': { $exists: true }
    });
    
    const totalRating = allSessions.reduce((sum, s) => sum + (s.rating?.score || 0), 0);
    supporter.rating = {
      average: totalRating / allSessions.length,
      count: allSessions.length
    };
    await supporter.save();

    res.json({ success: true, session });
  } catch (err) {
    console.error('❌ rateSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single session details
// @route   GET /api/sessions/:id
// @access  Private
exports.getSessionDetails = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('user', 'name email userType avatar')
      .populate('supporter', 'name email specialty topics avatar rating');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Check authorization
    const isAuthorized = 
      session.user._id.toString() === req.user._id.toString() ||
      session.supporter._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this session' 
      });
    }

    res.json({ success: true, session });
  } catch (err) {
    console.error('❌ getSessionDetails error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};