/**
 * API Routes Index
 * 
 * NOTE: This file is being phased out in favor of the TypeScript version.
 * Please use src/routes/index.ts for all new development.
 * This JavaScript version is kept for compatibility during migration.
 */

const express = require('express');
const router = express.Router();

// Import route files
const adminRoutes = require('./adminRoutes');
const authRoutes = require('./authRoutes');
const leadRoutes = require('./leadRoutes');
const geoSpatialRoutes = require('./geoSpatialRoutes');
const aiRoutes = require('./aiRoutes');
const documentAnalysisRoutes = require('./documentAnalysisRoutes');
const propertyAnalysisRoutes = require('./propertyAnalysisRoutes');
const firecrawlRoutes = require('./firecrawl');
const verificationRoutes = require('./verificationRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

// Register routes with their base paths
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/admin', adminRoutes);
router.use('/geospatial', geoSpatialRoutes);
router.use('/ai', aiRoutes);
router.use('/document-analysis', documentAnalysisRoutes);
router.use('/property-analysis', propertyAnalysisRoutes);
router.use('/firecrawl', firecrawlRoutes);
router.use('/verify', verificationRoutes);
router.use('/subscriptions', subscriptionRoutes);

// Add base routes
router.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Placeholder function for routes under development
const notImplemented = (req, res) => {
    res.status(501).json({
        success: false,
        error: {
            code: 'NOT_IMPLEMENTED',
            message: 'This feature is coming soon. The endpoint is planned but not yet implemented.'
        }
    });
};

// Placeholder routes
router.post('/leads/import', notImplemented);
router.get('/leads/export', notImplemented);

router.get('/users/me', notImplemented);
router.put('/users/me', notImplemented);
router.put('/users/me/password', notImplemented);

module.exports = router; 