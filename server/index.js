const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { initSocket } = require('./config/socket');

// Load env vars - THIS MUST BE AT THE VERY TOP
dotenv.config();

// Support both MONGO_URI and MONGODB_URI
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Debug: Check if env vars are loaded
console.log('🔍 Checking environment variables:');
console.log('📁 MONGO_URI:', MONGO_URI ? '✅ Found' : '❌ Missing');
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? '✅ Found' : '❌ Missing');
console.log('🚪 PORT:', process.env.PORT || '5000 (default)');
console.log('🌐 CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:3000');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:3000', 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
if (!MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI is not defined in .env file');
  console.log('📝 Please add to your .env file:');
  console.log('   MONGO_URI=mongodb://localhost:27017/peer-support-db');
  console.log('   or');
  console.log('   MONGODB_URI=mongodb://localhost:27017/peer-support-db');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('💡 Make sure MongoDB is installed and running:');
    console.log('   - Windows: Run "mongod" in command prompt');
    console.log('   - Or install MongoDB Community Edition');
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
// Temporary test endpoint for Google Auth
app.post('/api/test-google', (req, res) => {
  console.log('Test Google endpoint hit');
  res.json({ 
    success: true, 
    message: 'Test endpoint working',
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing'
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});