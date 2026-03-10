const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true }
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
  file: fileSchema,
  read: { 
    type: Boolean, 
    default: false 
  },
}, { 
  timestamps: true 
});

// Static method to generate conversation ID
messageSchema.statics.getConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);