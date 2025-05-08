import { Request, Response, NextFunction } from 'express';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandlers'; // Assuming error handlers are here
// Import the User model directly from models
import User from '../models/User'; 
// Import only UserPreferences from userTypes
import { UserPreferences } from '../types/userTypes';

// --- Type Definitions ---

// Describes a single subscription plan
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year'; // Example interval types
  features: string[];
  limits?: { // Optional limits, adjust based on actual plan details
    leadsPerMonth?: number;
    verifications?: number;
    // Add other relevant limits
  };
}

// Describes the structure of user's subscription data (likely stored on User model)
export interface UserSubscription {
  plan: string; // e.g., 'free', 'basic', 'premium'
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  startDate?: Date | number; // Use Date object preferably
  endDate?: Date | number | null; // Date or null for ongoing/free plans
  // Add other relevant fields: paymentMethodId, nextBillingDate, etc.
}

// Describes user usage statistics (likely stored on User model)
export interface UserUsageStats {
  leadsUploadedThisMonth?: number;
  verificationsUsedThisMonth?: number;
  lastActivity?: Date;
  loginHistory?: Array<{ date: Date; ipAddress?: string; userAgent?: string }>;
  // Add other relevant usage metrics
}

// --- Mock Database - Subscription Plans ---
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: ['Basic property search', '50 leads per month', 'Email support'],
    limits: {
      leadsPerMonth: 50,
      verifications: 10
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: ['Advanced property search', '500 leads per month', 'Email & phone support', 'Basic analytics'],
    limits: {
      leadsPerMonth: 500,
      verifications: 100
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Full property database access',
      'Unlimited leads',
      'Priority support',
      'Advanced analytics',
      'Bulk verification',
      'Team access (3 seats)'
    ],
    limits: {
      leadsPerMonth: 5000,
      verifications: 1000
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Full property database access',
      'Unlimited leads & verifications',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics & reporting',
      'Team access (10+ seats)',
      'White-label option'
    ]
  }
];

// --- Controller Methods ---

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { plans: subscriptionPlans }
  });
});

/**
 * Get user's current subscription details
 */
export const getCurrentSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(200).json({
    success: true,
    data: { subscription: user.subscription }
  });
});

/**
 * Update user's subscription plan
 */
export const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { planId } = req.body;
  
  if (!planId) {
    throw new ValidationError('Plan ID is required');
  }
  
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) {
    throw new ValidationError('Invalid subscription plan');
  }
  
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Update user's subscription
  user.subscription = {
    plan: planId,
    status: 'active',
    startDate: new Date(),
    // For paid plans, we would typically process payment here
    // and set appropriate billing cycle end date
    endDate: planId === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days for non-free plans
  };
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: `Successfully updated to ${plan.name} plan`,
    data: { subscription: user.subscription }
  });
});

/**
 * Cancel user's subscription
 */
export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  if (!user.subscription || user.subscription.plan === 'free') {
    throw new ValidationError('No active subscription to cancel');
  }
  
  // Update subscription status
  if (user.subscription) {
    user.subscription.status = 'cancelled';
    // In a real system, we would handle proration and set end date to billing period end
  }
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Subscription cancelled successfully',
    data: { subscription: user.subscription }
  });
});

/**
 * @route   GET /api/subscriptions/usage
 * @desc    Get current user's usage statistics
 * @access  Private
 */
export const getUserUsage = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || !authenticatedUser.id) {
        return next(new ValidationError('Authentication required.'));
    }
    const userId = authenticatedUser.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
        }

        // Return usage stats (uses Date objects internally)
        res.status(200).json({ success: true, data: { usage: user.usageStats } });
    } catch (error: any) {
        console.error('Usage stats fetch error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching usage statistics.', details: error.message } });
    }
});

export default {
  getSubscriptionPlans,
  getCurrentSubscription,
  updateSubscription,
  cancelSubscription,
  getUserUsage,
}; 