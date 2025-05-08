/**
 * Admin Routes
 * Handles all administration and user management functionality
 */
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth';

// Since we're in the middle of migration, we'll still import models from JS files
// These should be migrated to TypeScript in the future
const User = require('../../models/User');
const Lead = require('../../models/Lead');
const Organization = require('../../models/Organization');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticate);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get('/dashboard', async (req: Request, res: Response) => {
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
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skipIndex = (page - 1) * limit;
    const sortField = req.query.sortField as string || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Build filter object based on query params
    const filter: any = {};
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
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

// Additional routes from adminRoutes.js can be added here
// For brevity, we'll implement the most important ones and add placeholders for the rest

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get specific user details
 * @access  Admin
 */
router.get('/users/:userId', async (req: Request, res: Response) => {
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
router.post('/users', async (req: Request, res: Response) => {
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

// Additional routes can be added as needed

export default router; 