import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// Extend Request type to include user ID and role
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      user?: {
        id: string;
        email: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT tokens and adds user information to the request object
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { 
        code: 'UNAUTHENTICATED', 
        message: 'Authentication token is required and must be Bearer type.' 
      }
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as { 
      id: string; 
      email: string; 
      role: string 
    };
    
    // Add user data to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    let message = 'Invalid or expired token.';
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Token has expired.';
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = 'Token is invalid.';
    }
    
    return res.status(401).json({
      success: false,
      error: { 
        code: 'INVALID_TOKEN', 
        message 
      }
    });
  }
};

// Export authenticate as 'auth' for backward compatibility
export const auth = authenticate;

// Default export for backward compatibility
export default { authenticate, auth }; 