import express from 'express';
import authController from '../controllers/authController'; // Import default export
// Remove unused asyncHandler and ValidationError if no longer directly used here
// import { asyncHandler, ValidationError } from '../middleware/errorHandlers';

const router = express.Router();

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes (require authentication)
// The authenticate middleware is now part of authController for this mock setup
// In a real app, it might be imported from a dedicated middleware file
router.get('/me', authController.authenticate, authController.getCurrentUserProfile);
router.put('/me', authController.authenticate, authController.updateUserProfile);
router.put('/change-password', authController.authenticate, authController.changePassword);
router.put('/preferences', authController.authenticate, authController.updateUserPreferences);

// TODO: Add other protected routes from authRoutes.js and implement their controllers:

export default router; 