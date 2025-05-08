/**
 * Subscription Routes
 * Handles user subscription plans and payment processing
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/subscriptions
 * @desc    Get current user's subscription details
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ message: 'Server error fetching subscription details' });
  }
});

/**
 * @route   POST /api/subscriptions/change-plan
 * @desc    Change user's subscription plan (placeholder for payment integration)
 * @access  Private
 */
router.post('/change-plan', authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Validate plan
    const validPlans = ['free', 'basic', 'premium', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate end date (30 days from now for paid plans)
    let endDate = null;
    if (plan !== 'free') {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
    }

    // In a real app, you would integrate with a payment processor here
    // For MVP, we're just updating the subscription plan directly
    user.subscription.plan = plan;
    user.subscription.status = plan === 'free' ? 'active' : 'active';
    user.subscription.startDate = Date.now();
    user.subscription.endDate = endDate;

    await user.save();

    res.json({
      message: 'Subscription plan updated successfully',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Plan change error:', error);
    res.status(500).json({ message: 'Server error updating subscription plan' });
  }
});

/**
 * @route   POST /api/subscriptions/cancel
 * @desc    Cancel user's subscription
 * @access  Private
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real app, you would integrate with a payment processor to cancel subscription
    // For MVP, we're just updating to free plan
    user.subscription.plan = 'free';
    user.subscription.status = 'inactive';
    user.subscription.endDate = Date.now();

    await user.save();

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Subscription cancel error:', error);
    res.status(500).json({ message: 'Server error cancelling subscription' });
  }
});

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    // This would typically come from a database, but for MVP we'll hardcode
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          'Upload up to 100 leads per month',
          'Basic lead verification',
          'CSV exports'
        ],
        limits: {
          leadsPerMonth: 100,
          verifications: 50
        }
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Upload up to 1,000 leads per month',
          'Advanced lead verification',
          'Email verification',
          'CSV and Excel exports',
          'Dashboard analytics'
        ],
        limits: {
          leadsPerMonth: 1000,
          verifications: 500
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 49.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Upload up to 5,000 leads per month',
          'Advanced lead verification',
          'Email and phone verification',
          'All export formats',
          'Advanced analytics',
          'API access'
        ],
        limits: {
          leadsPerMonth: 5000,
          verifications: 2500
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Unlimited lead uploads',
          'All verification methods',
          'Priority processing',
          'Dedicated support',
          'Custom integration',
          'Team access'
        ],
        limits: {
          leadsPerMonth: 999999,
          verifications: 999999
        }
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ message: 'Server error fetching subscription plans' });
  }
});

/**
 * @route   GET /api/subscriptions/usage
 * @desc    Get current user's usage statistics
 * @access  Private
 */
router.get('/usage', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      usage: user.usageStats
    });
  } catch (error) {
    console.error('Usage stats fetch error:', error);
    res.status(500).json({ message: 'Server error fetching usage statistics' });
  }
});

module.exports = router; 