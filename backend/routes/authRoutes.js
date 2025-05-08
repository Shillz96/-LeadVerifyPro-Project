/**
 * Authentication Routes
 * Handles all user authentication and account management
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../dist/models/User');
const { authenticate } = require('../middleware/auth');
const config = require('../config/env');
const { isInOfflineMode } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || 'offline_user', email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Path for local storage of users when in offline mode
const offlineStoragePath = path.join(__dirname, '../cache', 'offline-users.json');

// Helper to ensure the cache directory exists
const ensureCacheDirectory = () => {
  const cacheDir = path.join(__dirname, '../cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
};

// Helper to get offline users
const getOfflineUsers = () => {
  ensureCacheDirectory();
  
  if (!fs.existsSync(offlineStoragePath)) {
    // Create default admin user if no users exist
    const defaultUsers = [{
      _id: 'offline_admin',
      email: 'admin@example.com',
      password: '$2a$10$eCjDNTWF0w3oDKfuuqD7RO92PKk3KWw/RTTqDyCJVL6s7Inx8.wlG', // hashed 'admin123'
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      emailVerified: true
    }];
    fs.writeFileSync(offlineStoragePath, JSON.stringify(defaultUsers, null, 2));
    return defaultUsers;
  }
  
  try {
    return JSON.parse(fs.readFileSync(offlineStoragePath, 'utf8'));
  } catch (error) {
    console.error('Error reading offline users:', error);
    return [];
  }
};

// Helper to save user to offline storage
const saveOfflineUser = (user) => {
  ensureCacheDirectory();
  
  try {
    const users = getOfflineUsers();
    const existingUserIndex = users.findIndex(u => u.email === user.email);
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = { ...users[existingUserIndex], ...user };
    } else {
      users.push(user);
    }
    
    fs.writeFileSync(offlineStoragePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving offline user:', error);
  }
};

// Offline password comparison
const compareOfflinePassword = (plainPassword, hashedPassword) => {
  const bcrypt = require('bcryptjs');
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required.'
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User already exists with this email.'
        }
      });
    }

    // Create verification token
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      company,
      emailVerificationToken,
      // In a real app, you would set emailVerified to false and send a verification email
      emailVerified: true // For MVP, we're setting this to true by default
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Return user info and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token: token,
        user: user.getProfile() // Assuming getProfile() returns the desired user object structure
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred during registration.'
      }
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required.'
        }
      });
    }

    // Handle offline mode if database is not available
    if (isInOfflineMode()) {
      console.log('System is in offline mode. Using local authentication.');
      
      const offlineUsers = getOfflineUsers();
      const offlineUser = offlineUsers.find(u => u.email === email);
      
      if (!offlineUser) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials (offline check).'
          }
        });
      }
      
      const isMatch = compareOfflinePassword(password, offlineUser.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid credentials (offline check).'
          }
        });
      }
      
      const token = generateToken(offlineUser);
      const userProfile = {
        id: offlineUser._id,
        email: offlineUser.email,
        firstName: offlineUser.firstName,
        lastName: offlineUser.lastName,
        role: offlineUser.role || 'user'
      };
      
      return res.status(200).json({
        success: true,
        message: 'Login successful (offline mode).',
        data: {
          token: token,
          user: userProfile
        }
      });
    }

    // Online mode - continue with normal authentication
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials.'
        }
      });
    }

    if (user.accountLocked) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Account is locked. Please contact support.'
        }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountLocked = true;
        await user.save();
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account locked due to too many failed login attempts. Please contact support.'
          }
        });
      }
      await user.save();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials.'
        }
      });
    }

    user.failedLoginAttempts = 0;
    user.usageStats.lastActivity = Date.now();
    if (!user.usageStats.loginHistory) {
      user.usageStats.loginHistory = [];
    }
    user.usageStats.loginHistory.unshift({
      date: new Date(),
      ipAddress,
      userAgent
    });
    if (user.usageStats.loginHistory.length > 10) {
      user.usageStats.loginHistory = user.usageStats.loginHistory.slice(0, 10);
    }
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token: token,
        user: user.getProfile()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred during login.'
      }
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error fetching profile'
      }
    });
  }
});

/**
 * @route   PUT /api/auth/me
 * @desc    Update user profile
 * @access  Private
 */
router.put('/me', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, company, phone } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (company) user.company = company;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getProfile()
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error updating profile'
      }
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal that the email doesn't exist
      return res.status(200).json({ // Return 200 to not reveal user existence
        success: true, // Indicate success to the client even if user not found
        message: 'Password reset email sent if account exists'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // In a real app, you would send an email with the reset link
    // For now, just return success message
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      // Dev only - remove in production
      data: {
        resetToken
      }
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error processing password reset'
      }
    });
  }
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token'
        }
      });
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error during password reset'
      }
    });
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error changing password'
      }
    });
  }
});

/**
 * @route   PUT /api/auth/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { notifications, dashboard } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Initialize preferences object if it doesn't exist
    if (!user.preferences) {
      user.preferences = {
        notifications: {
          email: true,
          sms: false,
          marketingEmails: true
        },
        dashboard: {
          defaultView: 'summary',
          theme: 'light'
        }
      };
    }

    // Update notification preferences
    if (notifications) {
      if (notifications.email !== undefined) user.preferences.notifications.email = notifications.email;
      if (notifications.sms !== undefined) user.preferences.notifications.sms = notifications.sms;
      if (notifications.marketingEmails !== undefined) user.preferences.notifications.marketingEmails = notifications.marketingEmails;
    }

    // Update dashboard preferences
    if (dashboard) {
      if (dashboard.defaultView) user.preferences.dashboard.defaultView = dashboard.defaultView;
      if (dashboard.theme) user.preferences.dashboard.theme = dashboard.theme;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Server error updating preferences'
      }
    });
  }
});

module.exports = router; 