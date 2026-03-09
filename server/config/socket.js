const { Server } = require('socket.io');
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => socket.join(userId));
    socket.on('sendMessage', (data) => io.to(data.recipientId).emit('receiveMessage', data));
    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => { if (!io) throw new Error('Socket not initialized'); return io; };
module.exports = { initSocket, getIO };