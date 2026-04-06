const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getMySessions,
  getSupporters,
  getAvailableSupporters,
  getPendingSessions,
  bookSession,
  acceptSession,
  rejectSession,
  completeSession,
  updateStatus,
  rateSession,
  getSessionDetails,
  // NEW CONTROLLER FUNCTIONS
  startLiveSession,
  extendSession,
  endSessionEarly,
  getLiveSessionStatus,
  getFeedbackQRCode,
  submitFeedbackByToken,
  approveExtension,
  rejectExtension
} = require('../controllers/sessionController');

// All session routes require authentication
router.use(protect);

// Common routes
router.get('/', getMySessions);
router.get('/supporters', getSupporters);
router.get('/available-supporters', getAvailableSupporters);
router.get('/pending', authorize('supporter'), getPendingSessions);
router.get('/:id', getSessionDetails);
router.get('/:id/live-status', getLiveSessionStatus);

// User routes
router.post('/', authorize('user'), bookSession);
router.post('/:id/rate', authorize('user'), rateSession);
router.put('/:id/start-live', authorize('user'), startLiveSession);
router.post('/:id/extend', authorize('user'), extendSession);
router.post('/:id/end-session', authorize('user'), endSessionEarly);
router.get('/:id/feedback-qr', authorize('user'), getFeedbackQRCode);

// Supporter routes
router.put('/:id/accept', authorize('supporter'), acceptSession);
router.put('/:id/reject', authorize('supporter'), rejectSession);
router.put('/:id/complete', authorize('supporter'), completeSession);
router.post('/:id/approve-extension', authorize('supporter'), approveExtension);
router.post('/:id/reject-extension', authorize('supporter'), rejectExtension);

// Shared routes
router.put('/:id/status', updateStatus);

// Public route for QR code feedback (no authentication needed)
router.post('/feedback/:token', submitFeedbackByToken);

module.exports = router;