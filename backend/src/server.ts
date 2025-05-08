import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import http from 'http';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Load environment variables
// try {
//   dotenv.config();
//   console.log('Environment variables loaded successfully.');
// } catch (error) {
//   console.warn('Warning: Error loading .env file:', error instanceof Error ? error.message : String(error));
//   console.log('Continuing with default environment variables.');
// }

// Import custom modules
import { config } from './config/env';
import mainRouter from './routes/index'; // Import the main router
// Import error handlers and file utilities
import { setupErrorHandlers } from './middleware/errorHandlers';
import { createUploadsDirectory } from './utils/fileUtils';
import subscriptionRoutes from './routes/subscriptionRoutes';
// Import FireCrawl routes - kept as require for backward compatibility
const firecrawlRoutes = require('../routes/firecrawl');
// Import verification routes - kept as require for backward compatibility
const verificationRoutes = require('../routes/verificationRoutes');

// Import rate limiting middleware
import { apiLimiter, authLimiter, verificationLimiter } from './middleware/rateLimit';

// Type definitions
interface ServerConfig {
  PORT: number;
  MONGO_URI: string;
  NODE_ENV: string;
}

// Initialize Express app
const app: Express = express();

// Define port from env or use default
const PORT: number = config.PORT;
const FALLBACK_PORTS: number[] = [5001, 5002, 5003, 5004, 5005];
const MONGO_URI: string = config.MONGO_URI;

// CORS Configuration with allowed origins
const allowedOrigins = [
  'https://leadverifypro-cypok74av-shillz96s-projects.vercel.app',
  'https://leadverifypro-shillz96-shillz96s-projects.vercel.app',
  'https://leadverifypro-qtckj9ugn-shillz96s-projects.vercel.app',
  'https://leadverifypro.vercel.app',
  'https://leadverifypro.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

// Allow requests from Vercel's preview deployment URLs
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like health checks, cURL, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Denied origin - ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Add compression middleware
app.use(compression());

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/verify', verificationLimiter);
app.use('/api', apiLimiter);

// Create uploads directory
createUploadsDirectory();

// Basic route to verify server is running
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to LeadVerifyPro API',
    status: 'Server is running',
    databaseConnected: mongoose.connection.readyState === 1,
    environment: config.NODE_ENV,
    version: '1.0.0'
  });
});

// Database connection with robust error handling
const connectDB = async (): Promise<boolean> => {
  let connectionAttempts = 0;
  const maxAttempts = 3;

  const connect = async (): Promise<boolean> => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('MongoDB connected successfully.');
      console.log(`Connected to database: ${MONGO_URI.split('@')[1].split('/')[0]}`);
      return true;
    } catch (err) {
      connectionAttempts++;
      console.error(`MongoDB connection attempt ${connectionAttempts} failed:`, err instanceof Error ? err.message : String(err));

      if (connectionAttempts >= maxAttempts) {
        console.error('Failed to connect to MongoDB after multiple attempts.');
        console.warn('API will operate in memory-only mode. Data will not be persisted.');
        return false;
      }

      console.log(`Retrying in 3 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      return await connect();
    }
  };

  return await connect();
};

// Connect to database
connectDB().then(connected => {
  if (!connected) {
    console.error('Failed to connect to the database after multiple attempts. The API cannot start without a database connection. Exiting.');
    process.exit(1); // Exit if connection definitively failed
  }
  // If connected, we can proceed. Server startup is handled later.
  console.log('Database connection successful, proceeding with server startup.');
}).catch(err => {
  console.error('Critical error during the database connection process. Server cannot start. Exiting.', err instanceof Error ? err.message : String(err));
  process.exit(1); // Exit on unexpected errors during the connection attempt itself
});

// Mount the main router
app.use('/api', mainRouter);

// API Documentation route
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    message: 'API Documentation',
    status: 'Coming Soon',
    info: 'API documentation will be available here soon.'
  });
});

// 404 handler
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: 'The requested API endpoint does not exist.',
      requestedPath: req.originalUrl
    }
  });
});

// Setup error handlers
setupErrorHandlers(app);

// Create HTTP server
const server = http.createServer(app);

// Server start function with port fallback
const startServer = (port: number, fallbackPorts: number[] = []): void => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`API URL: http://localhost:${port}`);
    console.log(`API Health Check: http://localhost:${port}/`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use.`);

      if (fallbackPorts.length > 0) {
        const nextPort = fallbackPorts[0];
        console.log(`Trying port ${nextPort}...`);
        startServer(nextPort, fallbackPorts.slice(1));
      } else {
        console.error('All ports are in use. Could not start the server.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

// Start server with fallback ports
startServer(PORT, FALLBACK_PORTS);

export default app; 