/**
 * Application Express instance
 *
 * NOTE: This file exists mainly for testing purposes and direct use in server.ts.
 * The main application setup and configuration is in server.ts.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { setupErrorHandlers } from './middleware/errorHandlers';

// Create Express application
const app = express();

// Basic middleware (for testing environments)
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Note: In production, routes are registered in server.ts
// This minimal configuration is primarily for testing

// Simple 404 handler for testing
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Route not found: ${req.url}`
    }
  });
});

// Add error handlers
setupErrorHandlers(app);

export default app; 