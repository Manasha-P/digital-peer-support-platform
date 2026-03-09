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
  getSessionDetails
} = require('../controllers/sessionController');

// All session routes require authentication
router.use(protect);

// Common routes
router.get('/', getMySessions);
router.get('/supporters', getSupporters);
router.get('/available-supporters', getAvailableSupporters);
router.get('/pending', authorize('supporter'), getPendingSessions);
router.get('/:id', getSessionDetails);

// User routes
router.post('/', authorize('user'), bookSession);
router.post('/:id/rate', authorize('user'), rateSession);

// Supporter routes
router.put('/:id/accept', authorize('supporter'), acceptSession);
router.put('/:id/reject', authorize('supporter'), rejectSession);
router.put('/:id/complete', authorize('supporter'), completeSession);

// Shared routes
router.put('/:id/status', updateStatus);

module.exports = router;