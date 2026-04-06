const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { 
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  deleteMessage,
  reactToMessage,
  updateMessageStatus
} = require('../controllers/Messagecontroller');
const Message = require('../models/Message');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// File upload endpoint
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const { recipientId } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient ID is required' 
      });
    }

    // Create message with file
    const conversationId = [req.user._id.toString(), recipientId.toString()].sort().join('_');
    
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      recipient: recipientId,
      text: `Shared a file: ${req.file.originalname}`,
      attachments: [{
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype,
        size: req.file.size
      }],
      status: 'sent',
      read: false
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar');

    res.status(201).json({ 
      success: true, 
      message: populatedMessage 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
});

// FIXED: Serve uploaded files - this route should be BEFORE /api
router.get('/uploads/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);
  
  console.log('Looking for file:', filepath);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ 
      success: false, 
      message: `File ${filename} not found` 
    });
  }
});

// Other message routes
router.get('/conversations', protect, getConversations);
router.get('/conversation/:userId', protect, getConversation);
router.post('/', protect, sendMessage);
router.put('/:messageId/read', protect, markAsRead);
router.delete('/:messageId', protect, deleteMessage);

// New WhatsApp-like features
router.post('/:messageId/react', protect, reactToMessage);
router.put('/status', protect, updateMessageStatus);

module.exports = router;