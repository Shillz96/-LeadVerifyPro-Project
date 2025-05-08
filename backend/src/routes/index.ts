import express, { Router, Request, Response } from 'express';

// Import migrated TypeScript route modules
import authRoutes from './authRoutes';
import leadRoutes from './leadRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import adminRoutes from './adminRoutes'; // Import from TypeScript file

// Import existing JavaScript route modules (ensure they are .js or compiled to .js in your build process)
// It's better to import them from their original location if they are not part of the TS build
// For now, assuming they will be available in the dist folder or need to be accessed via require
const geoSpatialRoutes = require('../../routes/geoSpatialRoutes'); // Adjust path if needed
const aiRoutes = require('../../routes/aiRoutes'); // Adjust path if needed
const documentAnalysisRoutes = require('../../routes/documentAnalysisRoutes'); // Adjust path if needed
const propertyAnalysisRoutes = require('../../routes/propertyAnalysisRoutes'); // Adjust path if needed
const firecrawlRoutes = require('../../routes/firecrawl'); // Adjust path if needed
const verificationRoutes = require('../../routes/verificationRoutes'); // Adjust path if needed

const router: Router = express.Router();

// Register routes with their base paths
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/admin', adminRoutes); // Use TypeScript adminRoutes

router.use('/geospatial', geoSpatialRoutes);
router.use('/ai', aiRoutes);
router.use('/document-analysis', documentAnalysisRoutes);
router.use('/property-analysis', propertyAnalysisRoutes);
router.use('/firecrawl', firecrawlRoutes);
router.use('/verify', verificationRoutes);

// Placeholder route handler
const createPlaceholderRoute = (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'This feature is coming soon. The endpoint is planned but not yet implemented.'
    }
  });
};

// Placeholder routes
router.post('/leads/import', createPlaceholderRoute);
router.get('/leads/export', createPlaceholderRoute);

router.get('/users/me', createPlaceholderRoute);
router.put('/users/me', createPlaceholderRoute);
router.put('/users/me/password', createPlaceholderRoute);

router.get('/reports', createPlaceholderRoute);
router.get('/reports/:id', createPlaceholderRoute);

router.post('/payments', createPlaceholderRoute);
router.get('/payments/history', createPlaceholderRoute);

router.get('/property-analysis/market-comparison', createPlaceholderRoute);
router.get('/property-analysis/predictive-analytics', createPlaceholderRoute);
router.get('/property-analysis/rental-estimate', createPlaceholderRoute);
router.get('/property-analysis/rehab-calculator', createPlaceholderRoute);

export default router; 