/**
 * Admin Routes (JavaScript version)
 * 
 * NOTE: This file is being phased out in favor of the TypeScript version.
 * Please use src/routes/adminRoutes.ts for all new development.
 * This JavaScript version is kept for compatibility during migration.
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { hasRole } = require('../middleware/roleChecks');
const User = require('../dist/models/User');
const Lead = require('../models/Lead');
const Organization = require('../models/Organization');

// Try to use the TypeScript version of auth middleware if available
let tsAuth;
try {
  // First try to load from compiled TypeScript
  tsAuth = require('../dist/middleware/auth');
  console.log('Admin routes using TypeScript auth middleware');
} catch (err) {
  // Fallback to JavaScript version
  console.log('Admin routes using JavaScript auth middleware');
}

// Apply auth middleware to all admin routes
router.use(auth);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get user stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 'subscription.status': { $in: ['active', 'trial'] } });
    const adminUsers = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email firstName lastName createdAt subscription.plan');
    
    // Get subscription stats
    const subscriptionStats = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          plan: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Get lead stats
    const totalLeads = await Lead.countDocuments();
    const leadsToday = await Lead.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    
    // User activity (last 7 days)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const userActivity = await User.aggregate([
      {
        $match: {
          'usageStats.lastActivity': { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$usageStats.lastActivity' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format the response
    res.json({
      userStats: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        recentUsers
      },
      subscriptionStats,
      leadStats: {
        total: totalLeads,
        today: leadsToday
      },
      userActivity
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Error fetching admin dashboard data' });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin
 */
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Build filter object based on query params
    const filter = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { company: searchRegex }
      ];
    }
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.subscriptionPlan) {
      filter['subscription.plan'] = req.query.subscriptionPlan;
    }
    
    if (req.query.subscriptionStatus) {
      filter['subscription.status'] = req.query.subscriptionStatus;
    }
    
    // Execute query with filters, sort, pagination
    const users = await User.find(filter)
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip(skipIndex)
      .select('-password');
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    
    res.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get specific user details
 * @access  Admin
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's leads count
    const leadsCount = await Lead.countDocuments({ user: req.params.userId });
    
    // Get user's recent leads
    const recentLeads = await Lead.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get organization info if applicable
    let organization = null;
    if (user.team && user.team.organization) {
      organization = await Organization.findById(user.team.organization)
        .select('name subscription members');
    }
    
    res.json({
      user,
      stats: {
        leadsCount,
        recentLeads
      },
      organization
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create new user (as admin)
 * @access  Admin
 */
router.post('/users', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company, role, subscriptionPlan, subscriptionStatus } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Validate role (only superadmin can create other admins)
    if ((role === 'admin' || role === 'superadmin') && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to create admin users' });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      company,
      role: role || 'user',
      emailVerified: true, // Admin-created accounts are pre-verified
      subscription: {
        plan: subscriptionPlan || 'free',
        status: subscriptionStatus || 'trial'
      }
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'User created successfully',
      user: user.getProfile()
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user details
 * @access  Admin
 */
router.put('/users/:userId', async (req, res) => {
  try {
    const { firstName, lastName, company, role, subscriptionPlan, subscriptionStatus, emailVerified } = req.body;
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent non-superadmins from updating admin users
    if ((user.role === 'admin' || user.role === 'superadmin') && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to update admin users' });
    }
    
    // Prevent role escalation to admin/superadmin by non-superadmins
    if ((role === 'admin' || role === 'superadmin') && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to grant admin privileges' });
    }
    
    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (company) user.company = company;
    if (role && req.userRole === 'superadmin') user.role = role;
    if (subscriptionPlan) user.subscription.plan = subscriptionPlan;
    if (subscriptionStatus) user.subscription.status = subscriptionStatus;
    if (emailVerified !== undefined) user.emailVerified = emailVerified;
    
    // Update subscription limits based on plan
    if (subscriptionPlan) {
      switch (subscriptionPlan) {
        case 'free':
          user.subscription.limits.leadsPerMonth = 50;
          user.subscription.limits.apiCallsPerDay = 100;
          user.subscription.limits.batchSize = 10;
          user.subscription.limits.advancedFeatures = false;
          break;
        case 'basic':
          user.subscription.limits.leadsPerMonth = 500;
          user.subscription.limits.apiCallsPerDay = 500;
          user.subscription.limits.batchSize = 50;
          user.subscription.limits.advancedFeatures = false;
          break;
        case 'premium':
          user.subscription.limits.leadsPerMonth = 5000;
          user.subscription.limits.apiCallsPerDay = 2000;
          user.subscription.limits.batchSize = 200;
          user.subscription.limits.advancedFeatures = true;
          break;
        case 'enterprise':
          user.subscription.limits.leadsPerMonth = 50000;
          user.subscription.limits.apiCallsPerDay = 10000;
          user.subscription.limits.batchSize = 1000;
          user.subscription.limits.advancedFeatures = true;
          break;
      }
    }
    
    await user.save();
    
    res.json({
      message: 'User updated successfully',
      user: user.getProfile()
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete a user
 * @access  Admin (superadmin only)
 */
router.delete('/users/:userId', async (req, res) => {
  try {
    // Only superadmins can delete users
    if (req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmins can delete users' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deletion of the last superadmin
    if (user.role === 'superadmin') {
      const superadminCount = await User.countDocuments({ role: 'superadmin' });
      if (superadminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last superadmin account' });
      }
    }
    
    // Delete user's leads
    await Lead.deleteMany({ user: req.params.userId });
    
    // Remove user from organizations
    await Organization.updateMany(
      { 'members.user': req.params.userId },
      { $pull: { members: { user: req.params.userId } } }
    );
    
    // Delete the user
    await User.findByIdAndDelete(req.params.userId);
    
    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

/**
 * @route   POST /api/admin/users/:userId/reset-password
 * @desc    Reset a user's password (admin function)
 * @access  Admin
 */
router.post('/users/:userId/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent non-superadmins from resetting admin passwords
    if ((user.role === 'admin' || user.role === 'superadmin') && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to reset an admin\'s password' });
    }
    
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Change user status (enable/disable account)
 * @access  Admin
 */
router.put('/users/:userId/status', async (req, res) => {
  try {
    const { accountLocked } = req.body;
    
    if (accountLocked === undefined) {
      return res.status(400).json({ message: 'Account locked status is required' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent non-superadmins from locking admin accounts
    if ((user.role === 'admin' || user.role === 'superadmin') && req.userRole !== 'superadmin') {
      return res.status(403).json({ message: 'You do not have permission to change an admin\'s account status' });
    }
    
    // Prevent locking the last superadmin account
    if (user.role === 'superadmin' && !accountLocked) {
      const activeSuperadmins = await User.countDocuments({ 
        role: 'superadmin', 
        accountLocked: false
      });
      
      if (activeSuperadmins <= 1) {
        return res.status(400).json({ message: 'Cannot lock the last active superadmin account' });
      }
    }
    
    user.accountLocked = accountLocked;
    
    await user.save();
    
    res.json({ 
      message: `User account ${accountLocked ? 'locked' : 'unlocked'} successfully`,
      user: user.getProfile()
    });
  } catch (error) {
    console.error('Admin user status change error:', error);
    res.status(500).json({ message: 'Error changing user status' });
  }
});

/**
 * @route   GET /api/admin/organizations
 * @desc    Get all organizations
 * @access  Admin
 */
router.get('/organizations', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    
    const organizations = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .populate('owner', 'email firstName lastName');
    
    const totalOrgs = await Organization.countDocuments();
    
    res.json({
      organizations,
      pagination: {
        total: totalOrgs,
        page,
        limit,
        pages: Math.ceil(totalOrgs / limit)
      }
    });
  } catch (error) {
    console.error('Admin organizations list error:', error);
    res.status(500).json({ message: 'Error fetching organizations' });
  }
});

module.exports = router; 