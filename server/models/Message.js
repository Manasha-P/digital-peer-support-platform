const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number },
  isVoiceNote: { type: Boolean, default: false },
  voiceNoteDuration: { type: Number } // in seconds
}, { _id: true });

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  conversationId: { 
    type: String, 
    required: true, 
    index: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    trim: true 
  },
  
  // Backwards compatibility legacy field
  file: attachmentSchema,
  
  // WhatsApp-like rich payload fields
  attachments: [attachmentSchema],
  reactions: [reactionSchema],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isForwarded: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }, // Soft-delete ("This message was deleted")

  // Delivery status tracking
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  read: { type: Boolean, default: false }, // Kept for frontend backwards compatibility
  
}, { 
  timestamps: true 
});

// Static method to generate conversation ID
messageSchema.statics.getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);