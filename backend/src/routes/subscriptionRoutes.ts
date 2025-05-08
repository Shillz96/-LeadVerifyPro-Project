import express from 'express';
import subscriptionController from '../controllers/subscriptionController';
// Assuming authenticate middleware comes from authController or a shared file
import authController from '../controllers/authController'; 

const router = express.Router();
const authenticate = authController.authenticate;

// Public route to get plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// Protected routes for managing user subscription
router.get('/', authenticate, subscriptionController.getUserSubscription);
router.post('/change-plan', authenticate, subscriptionController.changeSubscriptionPlan);
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);
router.get('/usage', authenticate, subscriptionController.getUserUsage);

// Remove old placeholder routes if they existed

export default router; 