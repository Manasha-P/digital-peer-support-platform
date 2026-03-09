const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const { ROLES, NOTIFICATION_TYPES } = require('../utils/constants');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user or supporter
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, userType, topics, bio, experience, qualifications } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email and password' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please sign in.' 
      });
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || ROLES.USER,
      userType: userType || 'College Student',
      isApproved: role === ROLES.SUPPORTER ? false : true,
      isActive: true
    };

    if (role === ROLES.SUPPORTER) {
      userData.topics = topics || [];
      userData.bio = bio || '';
      userData.experience = experience || '';
      userData.qualifications = qualifications || [];
      userData.specialty = topics && topics.length > 0 ? `${topics[0]} Specialist` : 'Peer Supporter';
    }

    const user = await User.create(userData);

    if (role === ROLES.SUPPORTER) {
      const admin = await User.findOne({ role: ROLES.ADMIN });
      if (admin) {
        await admin.addNotification(
          NOTIFICATION_TYPES.SUPPORTER_APPLICATION,
          `${user.name} has applied to become a supporter`,
          user._id
        );
      }
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'No account found with this email' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    if (!user.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'This account uses Google Sign-In. Please click "Sign in with Google".' 
      });
    }

    if (user.role === ROLES.SUPPORTER && !user.isApproved) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your supporter application is still pending approval. Please wait for admin review.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google credential missing' 
      });
    }

    console.log('🔍 Verifying Google token...');
    
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture: avatar } = ticket.getPayload();
    console.log('✅ Google user verified:', email);

    let user = await User.findOne({ 
      $or: [{ googleId }, { email: email.toLowerCase() }] 
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
      
      if (user.role === ROLES.SUPPORTER && !user.isApproved) {
        return res.status(403).json({ 
          success: false, 
          message: 'Your supporter application is still pending approval.' 
        });
      }
      
      return sendTokenResponse(user, 200, res);
    }

    user = await User.create({
      name,
      email: email.toLowerCase(),
      googleId,
      avatar: avatar || '',
      role: ROLES.USER,
      isApproved: true,
      isActive: true,
      userType: 'College Student'
    });

    console.log('✅ New user created via Google:', user.email);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('❌ Google auth error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Google sign-in failed. Please try again.' 
    });
  }
};

// @desc    Set user role
// @route   PUT /api/auth/set-role
// @access  Private
exports.setRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (![ROLES.USER, ROLES.SUPPORTER].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role must be user or supporter' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { 
        role, 
        isApproved: role === ROLES.USER ? true : false
      }, 
      { new: true }
    );

    if (role === ROLES.SUPPORTER) {
      const admin = await User.findOne({ role: ROLES.ADMIN });
      if (admin) {
        await admin.addNotification(
          NOTIFICATION_TYPES.SUPPORTER_APPLICATION,
          `${user.name} has applied to become a supporter`,
          user._id
        );
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('❌ setRole error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Set user type
// @route   PUT /api/auth/set-user-type
// @access  Private
exports.setUserType = async (req, res) => {
  try {
    const { userType } = req.body;
    
    if (!userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide user type' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { userType }, 
      { new: true }
    );
    
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('❌ setUserType error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('notifications');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ getMe error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'specialty', 'topics', 'userType', 'avatar',
      'experience', 'qualifications'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.topics && Array.isArray(req.body.topics)) {
      updates.topics = req.body.topics;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('❌ updateProfile error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please provide current password' 
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('❌ changePassword error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (err) {
    console.error('❌ logout error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};