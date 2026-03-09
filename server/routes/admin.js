const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { 
  getStats, 
  getPendingSupporters, 
  approveSupporter, 
  rejectSupporter, 
  getAllUsers, 
  toggleUserActive, 
  getAllSessions,
  getRecentActivities,
  getSessionStats,
  getSettings,
  updateSettings
} = require('../controllers/adminController');

// All admin routes are protected and require admin role
router.use(protect, isAdmin);

// Dashboard
router.get('/stats', getStats);
router.get('/activities', getRecentActivities);

// Supporter management
router.get('/supporters/pending', getPendingSupporters);
router.put('/supporters/:id/approve', approveSupporter);
router.put('/supporters/:id/reject', rejectSupporter);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserActive);

// Session management
router.get('/sessions', getAllSessions);
router.get('/sessions/stats', getSessionStats);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Health check (optional - for debugging)
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin API is working',
    timestamp: new Date().toISOString(),
    admin: req.user?.email
  });
});

module.exports = router;