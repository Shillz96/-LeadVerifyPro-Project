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

// --- Configuration Placeholders ---
const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-for-dev',
};
const isInOfflineMode = (): boolean => process.env.OFFLINE_MODE === 'true';

// --- Offline Storage Utilities ---
const offlineStoragePath = path.join(__dirname, '../../cache/firecrawl/offline-users.json');
const ensureCacheDirectory = () => {
  const cacheDir = path.dirname(offlineStoragePath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
};
const getOfflineUsersStorable = (): UserOfflineStorable[] => {
  ensureCacheDirectory();
  if (!fs.existsSync(offlineStoragePath)) {
    const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
    const defaultAdmin: UserOfflineStorable = {
      _id: 'offline_admin',
      email: 'admin@example.com',
      password: defaultAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      emailVerified: true,
      failedLoginAttempts: 0,
      accountLocked: false,
      preferences: { notifications: {}, dashboard: {} },
      subscription: { plan: 'enterprise', status: 'active', startDate: new Date().toISOString() },
      usageStats: { leadsUploadedThisMonth: 0, verificationsUsedThisMonth: 0, lastActivity: new Date().toISOString(), loginHistory: [] }
    };
    fs.writeFileSync(offlineStoragePath, JSON.stringify([defaultAdmin], null, 2));
    return [defaultAdmin];
  }
  try {
    const usersData = fs.readFileSync(offlineStoragePath, 'utf8');
    const users = JSON.parse(usersData) as UserOfflineStorable[];
    users.forEach(user => {
        if (!user.subscription) user.subscription = { plan: 'free', status: 'active', startDate: new Date().toISOString() };
        if (!user.usageStats) user.usageStats = { leadsUploadedThisMonth: 0, verificationsUsedThisMonth: 0, lastActivity: new Date().toISOString(), loginHistory: [] };
    });
    return users;
  } catch (error) {
    console.error('Error reading offline users storable data:', error);
    return [];
  }
};
const writeOfflineUsersStorable = (users: UserOfflineStorable[]) => {
  ensureCacheDirectory();
  try {
    fs.writeFileSync(offlineStoragePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing offline users storable data:', error);
  }
};

// --- Mock User Model (Class Implementation) ---
class UserModel implements UserType {
  _id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  preferences?: UserPreferences;
  subscription?: UserSubscription;
  usageStats?: UserUsageStats;

  constructor(data: Partial<UserOfflineStorable>) {
    this._id = data._id || `mock_${crypto.randomBytes(4).toString('hex')}`;
    if (!data.email) throw new Error("Email is required to construct a User");
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.company = data.company;
    this.role = data.role || 'user';
    this.emailVerified = data.emailVerified === undefined ? true : data.emailVerified;
    this.emailVerificationToken = data.emailVerificationToken;
    this.resetPasswordToken = data.resetPasswordToken;
    this.failedLoginAttempts = data.failedLoginAttempts || 0;
    this.accountLocked = data.accountLocked || false;
    this.preferences = data.preferences || { notifications: {}, dashboard: {} };

    // Convert ISO strings from Storable types to Date objects
    this.resetPasswordExpires = data.resetPasswordExpires ? new Date(data.resetPasswordExpires) : undefined;
    
    this.subscription = data.subscription ? {
        ...data.subscription,
        startDate: data.subscription.startDate ? new Date(data.subscription.startDate) : undefined,
        endDate: data.subscription.endDate ? new Date(data.subscription.endDate) : null
    } : { plan: 'free', status: 'active', startDate: new Date() };

    this.usageStats = data.usageStats ? {
        ...data.usageStats,
        lastActivity: data.usageStats.lastActivity ? new Date(data.usageStats.lastActivity) : undefined,
        loginHistory: data.usageStats.loginHistory?.map(entry => ({...entry, date: new Date(entry.date)}))
    } : { leadsUploadedThisMonth: 0, verificationsUsedThisMonth: 0, lastActivity: new Date(), loginHistory: [] };
  }

  async save(): Promise<UserType> {
    if (isInOfflineMode()) {
      const usersStorable = getOfflineUsersStorable();
      // Prepare the storable version, converting Dates to ISO strings
      const storableSubscription: UserSubscriptionStorable | undefined = this.subscription ? {
        ...this.subscription,
        startDate: this.subscription.startDate?.toISOString(),
        endDate: this.subscription.endDate?.toISOString() ?? null
      } : undefined;

      const storableUsageStats: UserUsageStatsStorable | undefined = this.usageStats ? {
        ...this.usageStats,
        lastActivity: this.usageStats.lastActivity?.toISOString(),
        loginHistory: this.usageStats.loginHistory?.map(entry => ({ ...entry, date: entry.date.toISOString() }))
      } : undefined;

      const userToSaveStorable: UserOfflineStorable = {
        _id: this._id,
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        company: this.company,
        role: this.role,
        emailVerified: this.emailVerified,
        emailVerificationToken: this.emailVerificationToken,
        resetPasswordToken: this.resetPasswordToken,
        resetPasswordExpires: this.resetPasswordExpires?.toISOString(),
        failedLoginAttempts: this.failedLoginAttempts,
        accountLocked: this.accountLocked,
        preferences: this.preferences,
        subscription: storableSubscription,
        usageStats: storableUsageStats
      };
      const existingUserIndex = usersStorable.findIndex(u => u._id === this._id || u.email === this.email);
      if (existingUserIndex >= 0) {
        usersStorable[existingUserIndex] = userToSaveStorable;
      } else {
        usersStorable.push(userToSaveStorable);
      }
      writeOfflineUsersStorable(usersStorable);
    } else {
      console.log(`(Online Mode) Mock User.save() called for ${this.email}`);
    }
    return this;
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compareSync(plainPassword, this.password);
  }

  getProfile(): Partial<UserOfflineStorable> {
    const storableSubscription: UserSubscriptionStorable | undefined = this.subscription ? {
      ...this.subscription,
      startDate: this.subscription.startDate?.toISOString(),
      endDate: this.subscription.endDate?.toISOString() ?? null
    } : undefined;

    return {
      _id: this._id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      company: this.company,
      role: this.role,
      emailVerified: this.emailVerified,
      preferences: this.preferences,
      subscription: storableSubscription,
    };
  }

  static async findOne(query: Partial<UserOfflineStorable>): Promise<UserType | null> {
    let userStorable: UserOfflineStorable | undefined;
    if (isInOfflineMode()) {
      const users = getOfflineUsersStorable();
      userStorable = users.find(u =>
        Object.entries(query).every(([key, value]) => {
            if (key.includes('.')) { 
                const keys = key.split('.');
                const nestedValue = (u as any)[keys[0]]?.[keys[1]];
                return nestedValue === value;
            }    
            return u[key as keyof UserOfflineStorable] === value;
        })
      );
    } else {
      console.log(`(Online Mode) Mock User.findOne() called with query:`, query);
      if (query.email === 'test@example.com') {
        userStorable = { _id: 'online-test-user', email: 'test@example.com', password: bcrypt.hashSync('password',10), subscription: {plan: 'basic', status: 'active', startDate: new Date().toISOString()}, usageStats: {leadsUploadedThisMonth: 5, lastActivity: new Date().toISOString()} };
      }
    }
    return userStorable ? new UserModel(userStorable) : null;
  }

  static async findById(id: string): Promise<UserType | null> {
    let userStorable: UserOfflineStorable | undefined;
    if (isInOfflineMode()) {
      const users = getOfflineUsersStorable();
      userStorable = users.find(u => u._id === id);
    } else {
      console.log(`(Online Mode) Mock User.findById() called with id: ${id}`);
       if (id === 'online-test-user') {
         userStorable = { _id: 'online-test-user', email: 'test@example.com', password: bcrypt.hashSync('password',10), subscription: {plan: 'basic', status: 'active', startDate: new Date().toISOString()}, usageStats: {leadsUploadedThisMonth: 5, lastActivity: new Date().toISOString()} };
      }
    }
    return userStorable ? new UserModel(userStorable) : null;
  }
}

// Export User model for potential use in other controllers (like subscriptionController)
export const User = UserModel;

// Helper function to generate JWT token
const generateToken = (user: UserType): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '7d' } // Or from config.JWT_EXPIRES_IN
  );
};

// --- Controller Methods ---

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, company } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const errCode = isInOfflineMode() ? 'USER_ALREADY_EXISTS_OFFLINE' : 'USER_ALREADY_EXISTS';
    return res.status(400).json({ success: false, error: { code: errCode, message: 'User already exists with this email.' } });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const emailVerificationToken = crypto.randomBytes(20).toString('hex');

  const newUser = new User({
    email,
    password: hashedPassword, // Store hashed password
    firstName,
    lastName,
    company,
    emailVerificationToken,
    emailVerified: isInOfflineMode() ? true : false, // Auto-verify for offline, require verification for online (typical)
  });

  if (!isInOfflineMode()) {
      newUser.emailVerified = true; // Matching original JS for MVP
  }

  const savedUser = await newUser.save();
  const token = generateToken(savedUser);

  res.status(201).json({
    success: true,
    message: `User registered successfully${isInOfflineMode() ? ' (offline mode)' : ''}.`,
    data: { token, user: savedUser.getProfile() }
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } });
  }

  const user = await User.findOne({ email });

  if (!user) {
    const errCode = isInOfflineMode() ? 'INVALID_CREDENTIALS_OFFLINE' : 'INVALID_CREDENTIALS';
    return res.status(400).json({ success: false, error: { code: errCode, message: 'Invalid credentials.' } });
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
    const errCode = isInOfflineMode() ? 'INVALID_CREDENTIALS_OFFLINE' : 'INVALID_CREDENTIALS';
    return res.status(400).json({ success: false, error: { code: errCode, message: 'Invalid credentials.' } });
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
    message: `Login successful${isInOfflineMode() ? ' (offline mode)' : ''}.`,
    data: { token, user: user.getProfile() }
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required.' } });
  }

  if (isInOfflineMode()) {
    return res.status(200).json({
      success: true,
      message: 'Password reset is not typically supported via email in offline mode.'
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If your email address is in our database, a recovery link will be sent.'
    });
  }

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  // TODO: Send email

  res.status(200).json({
    success: true,
    message: 'Password reset email sent (not really).',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password || !token) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password and token are required.' } });
  }

  if (isInOfflineMode()) {
    return res.status(400).json({ success: false, error: { code: 'OFFLINE_MODE_UNSUPPORTED', message: 'Password reset not supported offline.' } });
  }

  // Need to find by the token string, not the Date object
  const user = await User.findOne({ resetPasswordToken: token });

  if (!user) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token (user not found).' } });
  }
  
  if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token (token expired).' } });
  }

  user.password = bcrypt.hashSync(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.emailVerified = true;      
  user.accountLocked = false;     
  user.failedLoginAttempts = 0; 

  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful.' });
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
  const user = await User.findById(authenticatedUser.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }
  res.status(200).json({ success: true, data: { user: user.getProfile() } });
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  const { firstName, lastName, company } = req.body;

  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not authenticated.' } });
  }

  const user = await User.findById(authenticatedUser.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (company !== undefined) user.company = company;

  const updatedUser = await user.save();
  res.status(200).json({ success: true, message: 'Profile updated successfully.', data: { user: updatedUser.getProfile() } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user; 
  const { currentPassword, newPassword } = req.body;

  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not authenticated.' } });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Current and new password required.' } });
  }
  if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'New password too short.'}});
  }

  const user = await User.findById(authenticatedUser.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password incorrect.' } });
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
});

export const updateUserPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  const { notifications, dashboard } = req.body as { notifications?: UserPreferences['notifications'], dashboard?: UserPreferences['dashboard'] };

  if (!authenticatedUser || !authenticatedUser.id) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'User not authenticated.' } });
  }

  const user = await User.findById(authenticatedUser.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
  }

  if (!user.preferences) {
    user.preferences = { notifications: {}, dashboard: {} };
  }
  user.preferences.notifications = user.preferences.notifications || {};
  user.preferences.dashboard = user.preferences.dashboard || {};

  if (notifications) {
    if (notifications.email !== undefined) user.preferences.notifications.email = notifications.email;
    if (notifications.sms !== undefined) user.preferences.notifications.sms = notifications.sms;
    if (notifications.marketingEmails !== undefined) user.preferences.notifications.marketingEmails = notifications.marketingEmails;
  }
  if (dashboard) {
    if (dashboard.defaultView !== undefined) user.preferences.dashboard.defaultView = dashboard.defaultView;
    if (dashboard.theme !== undefined) user.preferences.dashboard.theme = dashboard.theme;
  }

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