const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const sent = await Message.find({ sender: req.user._id }).distinct('recipient');
    const received = await Message.find({ recipient: req.user._id }).distinct('sender');
    
    const partnerIds = [...new Set([...sent.map(String), ...received.map(String)])];
    
    // Include online status
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('name avatar role specialty isOnline lastSeen');

    const conversations = await Promise.all(partners.map(async (partner) => {
      const conversationId = Message.getConversationId(req.user._id, partner._id);
      
      const lastMessage = await Message.findOne({ conversationId })
        .sort({ createdAt: -1 });
      
      const unread = await Message.countDocuments({ 
        conversationId, 
        recipient: req.user._id, 
        status: { $ne: 'read' }, 
        read: false 
      });

      return {
        partner,
        lastMessage,
        unread
      };
    }));

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
    const otherUser = await User.findById(userId).select('name avatar isOnline lastSeen');
    
    if (!otherUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const conversationId = Message.getConversationId(req.user._id, userId);
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatar')
      .populate('replyTo', 'text sender attachments isDeleted') // Populate original message
      .sort({ createdAt: 1 })
      .limit(200); // Increased limit

    // Automatically mark all messages as read upon fetching
    await Message.updateMany(
      { conversationId, recipient: req.user._id, status: { $ne: 'read' } },
      { status: 'read', read: true }
    );

    res.json({ success: true, messages, partner: otherUser });
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
    const { recipientId, text, attachments = [], replyTo = null, isForwarded = false } = req.body;

    if (!recipientId || (!text?.trim() && attachments.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient ID and message content are required' 
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const conversationId = Message.getConversationId(req.user._id, recipientId);

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      recipient: recipientId,
      text: text ? text.trim() : '',
      attachments,
      replyTo,
      isForwarded,
      status: 'sent',
      read: false
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('replyTo', 'text sender attachments isDeleted');

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    console.error('❌ sendMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    React to a message
// @route   POST /api/messages/:messageId/react
// @access  Private
exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot react to a deleted message' });
    }

    // See if user already reacted
    const existingIndex = message.reactions.findIndex(r => r.user.toString() === req.user._id.toString());
    
    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Toggle off if same emoji
        message.reactions.splice(existingIndex, 1);
      } else {
        // Change emoji
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({ emoji, user: req.user._id });
    }

    await message.save();
    
    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    res.json({ success: true, message: populated });
  } catch (err) {
    console.error('❌ reactToMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a message (Soft delete)
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this message' });
    }

    // Soft delete to mimic WhatsApp
    message.isDeleted = true;
    message.text = ''; // Clear payload
    message.attachments = [];
    await message.save();

    res.json({ success: true, message: 'Message recalled successfully', deletedMessage: message });
  } catch (err) {
    console.error('❌ deleteMessage error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update status of multiple messages (e.g. delivered, read)
// @route   PUT /api/messages/status
// @access  Private
exports.updateMessageStatus = async (req, res) => {
  try {
    const { conversationId, status } = req.body;
    
    if (!['delivered', 'read'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // We only update messages sent TO the current user that haven't reached this status yet
    const query = { 
      conversationId, 
      recipient: req.user._id,
      status: status === 'read' ? { $ne: 'read' } : 'sent'
    };

    const updateDef = { status };
    if (status === 'read') updateDef.read = true; // backward compat

    await Message.updateMany(query, updateDef);

    res.json({ success: true, message: `Messages updated to ${status}` });
  } catch (err) {
    console.error('❌ updateMessageStatus error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Legacy fallback methods if needed by older frontends
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message || message.recipient.toString() !== req.user._id.toString()) return res.status(404).json({success: false});
    message.status = 'read';
    message.read = true;
    await message.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ recipient: req.user._id, status: { $ne: 'read' } });
    res.json({ success: true, count });
  } catch (err) { res.status(500).json({ success: false }); }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationId = Message.getConversationId(req.user._id, userId);
    await Message.updateMany({ conversationId, recipient: req.user._id }, { status: 'read', read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false }); }
};