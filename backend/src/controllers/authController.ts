import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandlers';
import { 
    UserType, 
    UserOfflineStorable, 
    UserPreferences, 
    UserSubscription, 
    UserUsageStats, 
    UserSubscriptionStorable, 
    UserUsageStatsStorable 
} from '../types/userTypes';
import User from '../models/User'; // Import the real Mongoose User model

// --- Configuration Placeholders ---
const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-for-dev',
};
const isInOfflineMode = (): boolean => process.env.OFFLINE_MODE === 'true';

// --- Token and Auth Helpers ---

/**
 * Generate JWT token for user authentication
 */
const generateToken = (user: UserType): string => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role || 'user'
  };
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '24h' });
};

// --- Offline Mode Support ---
const OFFLINE_USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

/**
 * Get all users from offline storage
 * @returns Array of user objects
 */
const getOfflineUsersStorable = (): UserOfflineStorable[] => {
  try {
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Check if users file exists, if not create with default user
    if (!fs.existsSync(OFFLINE_USERS_FILE)) {
      const defaultUser: UserOfflineStorable = {
        _id: 'default-user-id',
        email: 'admin@example.com',
        password: bcrypt.hashSync('password', 10), // Pre-hashed password
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        emailVerified: true
      };
      fs.writeFileSync(OFFLINE_USERS_FILE, JSON.stringify([defaultUser], null, 2));
      return [defaultUser];
    }

    // Read and parse the users file
    const usersData = fs.readFileSync(OFFLINE_USERS_FILE, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.error('Error reading offline users:', error);
    return [];
  }
};

/**
 * Save users to offline storage
 */
const saveOfflineUsers = (users: UserOfflineStorable[]): void => {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(OFFLINE_USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving offline users:', error);
  }
};

// --- Controller Methods ---

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, company } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } });
  }

  // Handle offline mode registration
  if (isInOfflineMode()) {
    const offlineUsers = getOfflineUsersStorable();
    const existingUser = offlineUsers.find(u => u.email === email);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'USER_ALREADY_EXISTS_OFFLINE', message: 'User already exists with this email (offline mode).' } 
      });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser: UserOfflineStorable = {
      _id: `offline_${crypto.randomBytes(4).toString('hex')}`,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      company,
      role: 'user',
      emailVerified: true,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date().toISOString()
      }
    };
    
    offlineUsers.push(newUser);
    saveOfflineUsers(offlineUsers);
    
    const token = generateToken({
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      company: newUser.company,
      role: newUser.role,
      emailVerified: newUser.emailVerified,
      save: async () => ({ ...newUser } as unknown as UserType),
      comparePassword: async () => true,
      getProfile: () => ({ ...newUser })
    });
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully (offline mode).',
      data: { 
        token, 
        user: {
          _id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          company: newUser.company,
          role: newUser.role
        } 
      }
    });
  }
  
  // Online mode - MongoDB registration
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, error: { code: 'USER_ALREADY_EXISTS', message: 'User already exists with this email.' } });
  }

  const emailVerificationToken = crypto.randomBytes(20).toString('hex');

  const newUser = new User({
    email,
    password, // Will be hashed by pre-save hook
    firstName,
    lastName,
    company,
    emailVerificationToken,
    emailVerified: true, // Auto-verify for MVP
  });

  const savedUser = await newUser.save();
  const token = generateToken(savedUser);

  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: { token, user: savedUser.getProfile() }
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } });
  }

  // Handle offline mode login
  if (isInOfflineMode()) {
    const offlineUsers = getOfflineUsersStorable();
    const offlineUser = offlineUsers.find(u => u.email === email);
    
    if (!offlineUser) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'INVALID_CREDENTIALS_OFFLINE', message: 'Invalid credentials (offline mode).' } 
      });
    }
    
    const isMatch = bcrypt.compareSync(password, offlineUser.password || '');
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'INVALID_CREDENTIALS_OFFLINE', message: 'Invalid credentials (offline mode).' } 
      });
    }
    
    const token = generateToken({
      _id: offlineUser._id,
      email: offlineUser.email,
      firstName: offlineUser.firstName,
      lastName: offlineUser.lastName,
      company: offlineUser.company,
      role: offlineUser.role,
      emailVerified: offlineUser.emailVerified,
      save: async () => ({ ...offlineUser } as unknown as UserType),
      comparePassword: async () => true,
      getProfile: () => ({ ...offlineUser })
    });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful (offline mode).',
      data: { 
        token, 
        user: {
          _id: offlineUser._id,
          email: offlineUser.email,
          firstName: offlineUser.firstName,
          lastName: offlineUser.lastName,
          company: offlineUser.company,
          role: offlineUser.role
        } 
      }
    });
  }

  // Online mode using MongoDB
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } });
  }

  if (user.accountLocked) {
    return res.status(403).json({ success: false, error: { code: 'ACCOUNT_LOCKED', message: 'Account is locked. Please contact support.' } });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.accountLocked = true;
    }
    await user.save(); // Save updated attempts/lock status
    return res.status(400).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' } });
  }

  user.failedLoginAttempts = 0;
  // Update last activity
  if (user.usageStats) {
    user.usageStats.lastActivity = new Date();
    // Could add login history here too
    // user.usageStats.loginHistory = user.usageStats.loginHistory || [];
    // user.usageStats.loginHistory.unshift({ date: new Date(), ipAddress: req.ip, userAgent: req.headers['user-agent'] });
    // if (user.usageStats.loginHistory.length > 10) user.usageStats.loginHistory.pop();
  }
  await user.save(); 

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: { token, user: user.getProfile() }
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required.' } });
  }

  // Handle offline mode
  if (isInOfflineMode()) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent (offline mode - no email sent).'
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal that the user doesn't exist
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

  await user.save();

  // Here you would normally send an email with the reset token
  // For now, we'll just return the token in the response
  res.status(200).json({
    success: true,
    message: 'Password reset link has been sent to your email.',
    // In production, do not return the token in the response - for testing only
    data: { resetToken } 
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Token and password are required.' } });
  }

  // Handle offline mode
  if (isInOfflineMode()) {
    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully (offline mode).'
    });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Password reset token is invalid or has expired.' } });
  }

  user.password = password; // Will be hashed by pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully.'
  });
});

// Authentication Middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Authentication token is required and must be Bearer type.' }
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; email: string; role: string };
    (req as any).user = decoded; // Attach decoded user info to request
    next();
  } catch (error) {
    let message = 'Invalid or expired token.';
    if (error instanceof jwt.TokenExpiredError) {
        message = 'Token has expired.';
    } else if (error instanceof jwt.JsonWebTokenError) {
        message = 'Token is invalid.';
    }
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message }
    });
  }
};

// User Profile Controllers
export const getCurrentUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not authenticated.' } });
  }

  // Handle offline mode
  if (isInOfflineMode()) {
    const offlineUsers = getOfflineUsersStorable();
    const offlineUser = offlineUsers.find(u => u._id === authenticatedUser.id);
    
    if (!offlineUser) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found (offline mode).' } });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: { 
        user: {
          _id: offlineUser._id,
          email: offlineUser.email,
          firstName: offlineUser.firstName,
          lastName: offlineUser.lastName,
          company: offlineUser.company,
          role: offlineUser.role,
          preferences: offlineUser.preferences
        } 
      } 
    });
  }

  const user = await User.findById(authenticatedUser.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }
  res.status(200).json({ success: true, data: { user: user.getProfile() } });
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not authenticated.' } });
  }

  const { firstName, lastName, company } = req.body;
  const updates: Partial<UserType> = {};

  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (company !== undefined) updates.company = company;

  // Handle offline mode
  if (isInOfflineMode()) {
    const offlineUsers = getOfflineUsersStorable();
    const userIndex = offlineUsers.findIndex(u => u._id === authenticatedUser.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found (offline mode).' } });
    }
    
    if (firstName !== undefined) offlineUsers[userIndex].firstName = firstName;
    if (lastName !== undefined) offlineUsers[userIndex].lastName = lastName;
    if (company !== undefined) offlineUsers[userIndex].company = company;
    
    saveOfflineUsers(offlineUsers);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully (offline mode).',
      data: { 
        user: {
          _id: offlineUsers[userIndex]._id,
          email: offlineUsers[userIndex].email,
          firstName: offlineUsers[userIndex].firstName,
          lastName: offlineUsers[userIndex].lastName,
          company: offlineUsers[userIndex].company,
          role: offlineUsers[userIndex].role
        } 
      } 
    });
  }

  // MongoDB update
  const user = await User.findByIdAndUpdate(
    authenticatedUser.id,
    { $set: updates },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: { user: user.getProfile() }
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not authenticated.' } });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Current password and new password are required.' } });
  }

  // Handle offline mode
  if (isInOfflineMode()) {
    const offlineUsers = getOfflineUsersStorable();
    const userIndex = offlineUsers.findIndex(u => u._id === authenticatedUser.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found (offline mode).' } });
    }
    
    const isMatch = bcrypt.compareSync(currentPassword, offlineUsers[userIndex].password || '');
    if (!isMatch) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect (offline mode).' } });
    }
    
    offlineUsers[userIndex].password = bcrypt.hashSync(newPassword, 10);
    saveOfflineUsers(offlineUsers);
    
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully (offline mode).'
    });
  }

  // MongoDB password change
  const user = await User.findById(authenticatedUser.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect.' } });
  }

  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully.'
  });
});

export const updateUserPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not authenticated.' } });
  }

  const { preferences } = req.body;

  if (!preferences) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Preferences are required.' } });
  }

  // Handle offline mode
  if (isInOfflineMode()) {
    const offlineUsers = getOfflineUsersStorable();
    const userIndex = offlineUsers.findIndex(u => u._id === authenticatedUser.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found (offline mode).' } });
    }
    
    offlineUsers[userIndex].preferences = {
      ...offlineUsers[userIndex].preferences,
      ...preferences
    };
    
    saveOfflineUsers(offlineUsers);
    
    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully (offline mode).',
      data: { preferences: offlineUsers[userIndex].preferences }
    });
  }

  // MongoDB preferences update
  const user = await User.findById(authenticatedUser.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  // Merge existing preferences with new ones
  user.preferences = {
    ...user.preferences,
    ...preferences
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully.',
    data: { preferences: user.preferences }
  });
});

export default {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  authenticate,
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  updateUserPreferences,
}; 