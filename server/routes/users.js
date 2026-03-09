const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getNotifications, 
  markNotificationsRead, 
  getSupporters,
  markNotificationAsRead,
  getProfile,
  updateProfile
} = require('../controllers/userController');

// All user routes require authentication
router.use(protect);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markNotificationsRead);
router.put('/notifications/:id/read', markNotificationAsRead);

// Supporters (for users)
router.get('/supporters', getSupporters);

module.exports = router;