const Session = require('../models/Session');
const User = require('../models/User');
const { NOTIFICATION_TYPES } = require('../utils/constants');
const crypto = require('crypto');
const QRCode = require('qrcode');

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

    let sessions = await Session.find(query)
      .populate('user', 'name email avatar userType')
      .populate('supporter', 'name email avatar specialty rating')
      .sort({ createdAt: -1 });
      
    // Auto Status Update Logic
    const now = new Date();
    let updated = false;

    for (let session of sessions) {
      if (['upcoming', 'live'].includes(session.status)) {
        const sessionDateStr = session.date.toISOString().split('T')[0];
        const sessionStartTime = new Date(`${sessionDateStr}T${session.time}`);
        // Default end time if currentEndTime is missing
        const endTime = session.currentEndTime || new Date(sessionStartTime.getTime() + session.duration * 60000);

        if (session.status === 'upcoming' && now >= sessionStartTime && now < endTime) {
          session.status = 'live';
          session.liveStartedAt = sessionStartTime;
          session.currentEndTime = endTime;
          await session.save();
          updated = true;
        } else if (['upcoming', 'live'].includes(session.status) && now > endTime) {
          session.status = 'ended';
          await session.save();
          updated = true;
        }
      }
    }

    if (updated) {
      // Re-fetch to ensure reactivity
      sessions = await Session.find(query)
        .populate('user', 'name email avatar userType')
        .populate('supporter', 'name email avatar specialty rating')
        .sort({ createdAt: -1 });
    }

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
    
    if (topic) {
      query.topics = topic;
    }
    
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

// @desc    Start a live session (when user joins)
// @route   PUT /api/sessions/:id/start-live
// @access  Private (User only)
exports.startLiveSession = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      status: 'upcoming'
    }).populate('supporter', 'name');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found or already started' 
      });
    }

    const now = new Date();
    const sessionStartTime = new Date(`${session.date.toISOString().split('T')[0]}T${session.time}`);
    
    if (now < sessionStartTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session has not started yet' 
      });
    }

    const originalEndTime = new Date(sessionStartTime.getTime() + session.duration * 60000);
    
    session.status = 'live';
    session.liveStartedAt = now;
    session.originalEndTime = originalEndTime;
    session.currentEndTime = originalEndTime;
    session.lastActivityAt = now;
    session.extendedEndRequested = false;
    
    await session.save();

    await session.supporter.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `${req.user.name} has joined the session. Session is now live!`,
      session._id
    );

    res.json({ 
      success: true, 
      session: {
        _id: session._id,
        status: session.status,
        remainingMinutes: session.remainingMinutes,
        currentEndTime: session.currentEndTime,
        originalEndTime: session.originalEndTime
      }
    });
  } catch (err) {
    console.error('❌ startLiveSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Extend session duration (User requests)
// @route   POST /api/sessions/:id/extend
// @access  Private (User only)
exports.extendSession = async (req, res) => {
  try {
    const { additionalMinutes } = req.body;
    
    if (!additionalMinutes || ![15, 30, 45].includes(additionalMinutes)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select valid extension time (15, 30, or 45 minutes)' 
      });
    }

    const session = await Session.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      status: 'live'
    }).populate('supporter', 'name');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Live session not found' 
      });
    }

    if (session.extendedEndRequested) {
      return res.status(400).json({ 
        success: false, 
        message: 'Extension already requested' 
      });
    }

    const newEndTime = new Date(session.currentEndTime.getTime() + additionalMinutes * 60000);
    
    session.extensions.push({
      duration: additionalMinutes,
      requestedAt: new Date(),
      status: 'pending'
    });
    
    session.extendedEndRequested = true;
    
    await session.save();

    // Notify supporter about extension request
    await session.supporter.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `${req.user.name} has requested to extend the session by ${additionalMinutes} minutes. Please approve or reject.`,
      session._id
    );

    res.json({ 
      success: true, 
      message: `Extension request sent to supporter for ${additionalMinutes} minutes`,
      session: {
        remainingMinutes: session.remainingMinutes,
        currentEndTime: session.currentEndTime,
        totalExtendedMinutes: session.totalExtendedMinutes
      }
    });
  } catch (err) {
    console.error('❌ extendSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    End session early (User chooses to end)
// @route   POST /api/sessions/:id/end-session
// @access  Private (User only)
exports.endSessionEarly = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      status: 'live'
    }).populate('supporter', 'name');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Live session not found' 
      });
    }

    session.status = 'ended';
    await session.save();

    await session.supporter.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `${req.user.name} has ended the session. Please mark it as complete.`,
      session._id
    );

    res.json({ 
      success: true, 
      message: 'Session ended. Supporter will mark it as complete.',
      session
    });
  } catch (err) {
    console.error('❌ endSessionEarly error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark session as complete (Supporter) - With QR Code Generation
// @route   PUT /api/sessions/:id/complete
// @access  Private (Supporter only)
exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      supporter: req.user._id,
      status: { $in: ['upcoming', 'live', 'ended'] }
    }).populate('user');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    const feedbackToken = crypto.randomBytes(32).toString('hex');
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const feedbackLink = `${baseUrl}/feedback/${feedbackToken}`;
    
    // Generate actual QR code data url using qrcode package
    const qrDataUrl = await QRCode.toDataURL(feedbackLink);
    
    session.status = 'completed';
    session.feedbackToken = feedbackToken;
    session.feedbackLink = feedbackLink;
    session.feedbackQRCode = qrDataUrl;
    session.feedbackSubmitted = false;
    session.feedbackViewed = false;
    await session.save();

    await session.user.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `✨ Your session with ${req.user.name} is complete! Please rate your experience.`,
      session._id
    );

    res.json({ 
      success: true, 
      message: 'Session marked as complete',
      session: {
        _id: session._id,
        status: session.status,
        feedbackLink: session.feedbackLink,
        feedbackToken: session.feedbackToken,
        feedbackQRCode: session.feedbackQRCode
      }
    });
  } catch (err) {
    console.error('❌ completeSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get live session status and remaining time
// @route   GET /api/sessions/:id/live-status
// @access  Private
exports.getLiveSessionStatus = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    res.json({ 
      success: true, 
      isLive: session.status === 'live',
      remainingMinutes: session.remainingMinutes, // Virtual method uses getRemainingMinutes()
      needsExtensionPrompt: session.needsExtensionPrompt,
      currentEndTime: session.currentEndTime
    });
  } catch (err) {
    console.error('❌ getLiveSessionStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get feedback QR code for a session
// @route   GET /api/sessions/:id/feedback-qr
// @access  Private (User only)
exports.getFeedbackQRCode = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      status: 'completed'
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Completed session not found' 
      });
    }

    if (!session.feedbackQRCode) {
      return res.status(404).json({ 
        success: false, 
        message: 'QR code not generated yet' 
      });
    }

    session.feedbackViewed = true;
    await session.save();

    res.json({ 
      success: true, 
      feedbackLink: session.feedbackLink,
      feedbackToken: session.feedbackToken,
      qrData: session.feedbackQRCode,
      qrCodeUrl: session.feedbackQRCode
    });
  } catch (err) {
    console.error('❌ getFeedbackQRCode error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit feedback via QR code token
// @route   POST /api/sessions/feedback/:token
// @access  Public (via QR code)
exports.submitFeedbackByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Score must be between 1 and 5' 
      });
    }

    const session = await Session.findOne({ 
      feedbackToken: token,
      status: 'completed'
    }).populate('supporter');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found or invalid token' 
      });
    }

    if (session.rating?.score) {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback already submitted' 
      });
    }

    session.rating = { 
      score, 
      comment: comment || '', 
      submittedAt: new Date() 
    };
    session.feedbackSubmitted = true;
    await session.save();

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

    await supporter.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `✨ You received a new rating of ${score}/5 from a session!`,
      session._id
    );

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback!',
      rating: session.rating
    });
  } catch (err) {
    console.error('❌ submitFeedbackByToken error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve session extension request (Supporter)
// @route   POST /api/sessions/:id/approve-extension
// @access  Private (Supporter only)
exports.approveExtension = async (req, res) => {
  try {
    const { minutes } = req.body;
    const session = await Session.findOne({ 
      _id: req.params.id, 
      supporter: req.user._id,
      status: 'live'
    }).populate('user', 'name');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Live session not found' 
      });
    }

    const pendingExtension = session.extensions.find(e => e.status === 'pending');
    if (!pendingExtension) {
      return res.status(400).json({ 
        success: false, 
        message: 'No pending extension request found' 
      });
    }

    pendingExtension.status = 'approved';
    pendingExtension.approvedAt = new Date();
    
    const newEndTime = new Date(session.currentEndTime.getTime() + minutes * 60000);
    session.currentEndTime = newEndTime;
    session.totalExtendedMinutes += minutes;
    session.extendedEndRequested = false;
    
    await session.save();

    await session.user.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `✅ ${req.user.name} approved your session extension! Session extended by ${minutes} minutes.`,
      session._id
    );

    res.json({ 
      success: true, 
      message: `Extension approved. Session extended by ${minutes} minutes.`,
      session: {
        remainingMinutes: session.remainingMinutes,
        currentEndTime: session.currentEndTime,
        totalExtendedMinutes: session.totalExtendedMinutes
      }
    });
  } catch (err) {
    console.error('❌ approveExtension error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reject session extension request (Supporter)
// @route   POST /api/sessions/:id/reject-extension
// @access  Private (Supporter only)
exports.rejectExtension = async (req, res) => {
  try {
    const session = await Session.findOne({ 
      _id: req.params.id, 
      supporter: req.user._id,
      status: 'live'
    }).populate('user', 'name');

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Live session not found' 
      });
    }

    const pendingExtension = session.extensions.find(e => e.status === 'pending');
    if (!pendingExtension) {
      return res.status(400).json({ 
        success: false, 
        message: 'No pending extension request found' 
      });
    }

    pendingExtension.status = 'rejected';
    session.extendedEndRequested = false;
    
    await session.save();

    await session.user.addNotification(
      NOTIFICATION_TYPES.SESSION_UPDATE,
      `⚠️ ${req.user.name} could not approve your extension request. The session will end at the scheduled time.`,
      session._id
    );

    res.json({ 
      success: true, 
      message: 'Extension request rejected',
      session: {
        remainingMinutes: session.remainingMinutes,
        currentEndTime: session.currentEndTime
      }
    });
  } catch (err) {
    console.error('❌ rejectExtension error:', err);
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

// @desc    Rate a completed session (Direct - alternative to QR)
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
    session.feedbackSubmitted = true;
    await session.save();

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

// @desc    Get live session status with remaining time
// @route   GET /api/sessions/:id/live-status
// @access  Private
exports.getLiveSessionStatus = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    const isAuthorized = 
      session.user._id.toString() === req.user._id.toString() ||
      session.supporter._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    res.json({ 
      success: true, 
      status: session.status,
      isLive: session.status === 'live',
      remainingMinutes: session.remainingMinutes,
      needsExtensionPrompt: session.needsExtensionPrompt,
      currentEndTime: session.currentEndTime,
      totalExtendedMinutes: session.totalExtendedMinutes
    });
  } catch (err) {
    console.error('❌ getLiveSessionStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};