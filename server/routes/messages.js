const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  markAllAsRead
} = require('../controllers/MessageController');

// All message routes require authentication
router.use(protect);

// Conversations
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getConversation);

// Messages
router.post('/', sendMessage);
router.put('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

// Unread counts
router.get('/unread/count', getUnreadCount);
router.put('/read-all/:userId', markAllAsRead);

module.exports = router;