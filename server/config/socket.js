const { Server } = require('socket.io');
const User = require('../models/User');
let io;

// Track socket to user mapping in memory for quick lookups
const userSocketMap = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: { 
      origin: process.env.CLIENT_URL || 'http://localhost:3000', 
      methods: ['GET', 'POST', 'PUT', 'DELETE'] 
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // User joins their personal room and updates online status
    socket.on('join', async (userId) => {
      socket.join(userId);
      userSocketMap.set(socket.id, userId);
      
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        socket.broadcast.emit('user_presence_change', { userId, isOnline: true });
      } catch (err) {
        console.error('Error updating presence:', err);
      }
    });

    // ----------------------------------------------------
    // WHATSAPP-STYLE LIVE EVENTS
    // ----------------------------------------------------

    // 1. Basic Messaging
    socket.on('sendMessage', (data) => {
      io.to(data.recipientId).emit('receiveMessage', data);
      // Auto-emit delivered if recipient is online
      io.to(data.recipientId).emit('message_delivered_push', { messageId: data._id });
    });

    // 2. Typing Indicators
    socket.on('typing_start', ({ senderId, recipientId }) => {
      io.to(recipientId).emit('typing_start', { senderId });
    });

    socket.on('typing_stop', ({ senderId, recipientId }) => {
      io.to(recipientId).emit('typing_stop', { senderId });
    });

    // 3. Read Receipts
    socket.on('messages_delivered', ({ senderId, messageIds }) => {
      io.to(senderId).emit('messages_delivered', { messageIds });
    });

    socket.on('messages_read', ({ senderId, messageIds }) => {
      io.to(senderId).emit('messages_read', { messageIds });
    });

    // 4. Reactions and Deletions
    socket.on('message_reacted', ({ recipientId, messageId, reaction }) => {
      io.to(recipientId).emit('message_reacted', { messageId, reaction });
    });

    socket.on('message_deleted', ({ recipientId, messageId }) => {
      io.to(recipientId).emit('message_deleted', { messageId });
    });

    // ----------------------------------------------------
    // DISCONNECTION HANDLING
    // ----------------------------------------------------
    socket.on('disconnect', async () => {
      const userId = userSocketMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(socket.id);
        const lastSeen = new Date();
        try {
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
          io.emit('user_presence_change', { userId, isOnline: false, lastSeen });
        } catch (err) {
          console.error('Error updating presence on disconnect:', err);
        }
      }
    });

  });

  return io;
};

const getIO = () => { 
  if (!io) throw new Error('Socket not initialized'); 
  return io; 
};

module.exports = { initSocket, getIO };