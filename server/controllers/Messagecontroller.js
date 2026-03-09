const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Find all messages where user is either sender or recipient
    const sent = await Message.find({ sender: req.user._id }).distinct('recipient');
    const received = await Message.find({ recipient: req.user._id }).distinct('sender');
    
    // Combine and get unique partner IDs
    const partnerIds = [...new Set([...sent.map(String), ...received.map(String)])];
    
    // Get partner details
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('name avatar role specialty');

    // Build conversations with last message and unread count
    const conversations = await Promise.all(partners.map(async (partner) => {
      const conversationId = Message.getConversationId(req.user._id, partner._id);
      
      const lastMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1 });
      
      const unread = await Message.countDocuments({ 
        conversationId, 
        recipient: req.user._id, 
        read: false 
      });

      return {
        partner,
        lastMessage,
        unread
      };
    }));

    // Sort by most recent message
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || 0;
      const timeB = b.lastMessage?.createdAt || 0;
      return new Date(timeB) - new Date(timeA);
    });

    res.json({ success: true, conversations });
  } catch (err) {
    console.error('❌ getConversations error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get conversation with a specific user
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate that the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const conversationId = Message.getConversationId(req.user._id, userId);
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId, 
        recipient: req.user._id, 
        read: false 
      },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    console.error('❌ getConversation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;

    if (!recipientId || !text?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient ID and message text are required' 
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    const conversationId = Message.getConversationId(req.user._id, recipientId);

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
      read: false
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar');

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    console.error('❌ sendMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark a message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to mark this message as read' 
      });
    }

    message.read = true;
    await message.save();

    res.json({ success: true, message: 'Message marked as read' });
  } catch (err) {
    console.error('❌ markAsRead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this message' 
      });
    }

    await message.deleteOne();

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('❌ deleteMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ 
      recipient: req.user._id, 
      read: false 
    });

    res.json({ success: true, count });
  } catch (err) {
    console.error('❌ getUnreadCount error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark all messages from a user as read
// @route   PUT /api/messages/read-all/:userId
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversationId = Message.getConversationId(req.user._id, userId);

    await Message.updateMany(
      { 
        conversationId, 
        recipient: req.user._id, 
        read: false 
      },
      { read: true }
    );

    res.json({ success: true, message: 'All messages marked as read' });
  } catch (err) {
    console.error('❌ markAllAsRead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};