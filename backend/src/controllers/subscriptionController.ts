import { Request, Response, NextFunction } from 'express';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandlers'; // Assuming error handlers are here
// Import the User model from authController (assuming it's exported)
import { User } from './authController'; 
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

// --- Mock Data (Hardcoded plans as in JS version) ---
// In a real app, fetch this from a database or config file
const availablePlans: SubscriptionPlan[] = [
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
      leadsPerMonth: 999999, // Using large numbers for effective unlimited
      verifications: 999999
    }
  }
];

// --- Controller Methods ---

/**
 * @route   GET /api/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
export const getSubscriptionPlans = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { plans: availablePlans } });
});

/**
 * @route   GET /api/subscriptions
 * @desc    Get current user's subscription details
 * @access  Private
 */
export const getUserSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user; // Populated by authenticate middleware
  if (!authenticatedUser || !authenticatedUser.id) {
      return next(new ValidationError('Authentication required.'));
  }

  try {
    const user = await User.findById(authenticatedUser.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
    }

    // Return the subscription details (which uses Date objects internally)
    res.status(200).json({ success: true, data: { subscription: user.subscription } });
  } catch (error: any) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching subscription details.', details: error.message } });
  }
});

/**
 * @route   POST /api/subscriptions/change-plan
 * @desc    Change user's subscription plan (placeholder for payment integration)
 * @access  Private
 */
export const changeSubscriptionPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || !authenticatedUser.id) {
        return next(new ValidationError('Authentication required.'));
    }
    const userId = authenticatedUser.id;
    const { plan } = req.body as { plan: string };

    // Validate plan against available plans
    const validPlans = availablePlans.map(p => p.id);
    if (!plan || !validPlans.includes(plan)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PLAN', message: 'Invalid subscription plan specified.' } });
    }

    try {
        const user = await User.findById(userId);
        if (!user || !user.subscription) {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User or user subscription not found.' } });
        }

        // In a real app: payment processing logic here
        console.log(`User ${userId} changing plan to ${plan}. (Mock - no payment processed)`);

        let endDate: Date | null = null;
        if (plan !== 'free') {
            endDate = new Date();
            endDate.setDate(endDate.getDate() + 30); // Mock: 30 days validity
        }

        // Update user's subscription object (uses Date objects)
        user.subscription.plan = plan;
        user.subscription.status = 'active'; // Assume change makes it active
        user.subscription.startDate = new Date();
        user.subscription.endDate = endDate;

        await user.save(); // UserModel save handles conversion for storage

        res.status(200).json({
            success: true,
            message: 'Subscription plan updated successfully.',
            data: { subscription: user.subscription } // Return internal representation
        });
    } catch (error: any) {
        console.error('Plan change error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error updating subscription plan.', details: error.message } });
    }
});

/**
 * @route   POST /api/subscriptions/cancel
 * @desc    Cancel user's subscription
 * @access  Private
 */
export const cancelSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || !authenticatedUser.id) {
        return next(new ValidationError('Authentication required.'));
    }
    const userId = authenticatedUser.id;

    try {
        const user = await User.findById(userId);
        if (!user || !user.subscription) {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User or user subscription not found.' } });
        }

        // In a real app: interact with payment processor
        console.log(`User ${userId} cancelling subscription. (Mock)`);

        // Update subscription status (downgrade to free or mark inactive)
        user.subscription.plan = 'free'; // Or keep current plan but change status
        user.subscription.status = 'cancelled'; // Or 'inactive'
        user.subscription.endDate = new Date(); // Cancellation effective now

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully.',
            data: { subscription: user.subscription } // Return internal representation
        });
    } catch (error: any) {
        console.error('Subscription cancel error:', error);
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error cancelling subscription.', details: error.message } });
    }
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
  getUserSubscription,
  changeSubscriptionPlan,
  cancelSubscription,
  getUserUsage,
}; 