const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  register, 
  login, 
  googleAuth, 
  setRole, 
  setUserType, 
  getMe, 
  updateProfile, 
  changePassword,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);  // Make sure this line exists

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/set-role', setRole);
router.put('/set-user-type', setUserType);
router.post('/logout', logout);

module.exports = router;