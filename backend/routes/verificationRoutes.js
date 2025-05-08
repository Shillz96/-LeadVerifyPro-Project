/**
 * Verification Routes
 * API endpoints for verification services
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Lead = require('../models/Lead');
const Verification = require('../models/Verification');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const ApiIntegration = require('../models/ApiIntegration');
const axios = require('axios');

// POST /api/verify/phone - Verify a phone number
router.post('/phone', auth, async (req, res) => {
  try {
    const { phoneNumber, leadId } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PHONE_NUMBER',
          message: 'Phone number is required for verification.'
        }
      });
    }
    
    // Check user subscription and limits
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        }
      });
    }
    
    // Check subscription and usage limits
    const hasSubscription = user.subscription && user.subscription.status === 'active';
    const isPhoneVerificationAllowed = hasSubscription || user.subscription.plan === 'free';
    
    if (!isPhoneVerificationAllowed) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'Active subscription required for phone verification.'
        }
      });
    }
    
    // Get API integration for phone verification
    const phoneApi = await ApiIntegration.findOne({ 
      type: 'phoneVerification',
      isActive: true
    });
    
    if (!phoneApi) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'API_NOT_AVAILABLE',
          message: 'Phone verification service is currently unavailable.'
        }
      });
    }
    
    // Check rate limiting
    if (phoneApi.isRateLimited()) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'API rate limit exceeded. Please try again later.'
        }
      });
    }
    
    // Format phone number (remove non-digits)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    
    // Call the phone verification API
    try {
      // Log API call
      await phoneApi.logApiCall();
      
      // Mock API call for now (replace with actual API integration)
      const verificationResult = {
        valid: Math.random() > 0.2, // 80% chance of being valid for mock data
        carrier: 'Sample Carrier',
        lineType: Math.random() > 0.5 ? 'mobile' : 'landline',
        countryCode: 'US',
        confidence: Math.floor(Math.random() * 40) + 60 // Random value between 60-100
      };
      
      // Create or update verification record
      let verification;
      
      if (leadId) {
        // Find the lead
        const lead = await Lead.findById(leadId);
        if (!lead) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'LEAD_NOT_FOUND',
              message: 'Lead not found.'
            }
          });
        }
        
        // Check if verification record exists
        verification = await Verification.findOne({ lead: leadId });
        
        if (verification) {
          // Update existing verification
          verification.phoneVerification = {
            status: verificationResult.valid ? 'valid' : 'invalid',
            provider: phoneApi.provider,
            verifiedAt: new Date(),
            details: {
              carrier: verificationResult.carrier,
              lineType: verificationResult.lineType,
              countryCode: verificationResult.countryCode
            },
            confidence: verificationResult.confidence
          };
          await verification.save();
        } else {
          // Create new verification
          verification = new Verification({
            lead: leadId,
            user: req.userId,
            phoneVerification: {
              status: verificationResult.valid ? 'valid' : 'invalid',
              provider: phoneApi.provider,
              verifiedAt: new Date(),
              details: {
                carrier: verificationResult.carrier,
                lineType: verificationResult.lineType,
                countryCode: verificationResult.countryCode
              },
              confidence: verificationResult.confidence
            }
          });
          await verification.save();
        }
        
        // Update lead status if verification is complete
        if (verification.phoneVerification.status === 'valid' &&
            (verification.addressVerification?.status === 'valid' || 
             verification.ownershipVerification?.status === 'confirmed')) {
          await Lead.findByIdAndUpdate(leadId, { 
            status: 'verified',
            score: verification.calculateScore()
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Phone verification completed.',
        data: {
          phoneNumber: formattedPhone,
          verificationResult: {
            valid: verificationResult.valid,
            carrier: verificationResult.carrier,
            lineType: verificationResult.lineType,
            countryCode: verificationResult.countryCode,
            confidence: verificationResult.confidence
          },
          verificationId: verification?._id
        }
      });
    } catch (apiError) {
      console.error('Phone API error:', apiError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Error connecting to phone verification service.'
        }
      });
    }
  } catch (error) {
    console.error('Phone verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred during phone verification.'
      }
    });
  }
});

// POST /api/verify/property - Verify property ownership
router.post('/property', auth, async (req, res) => {
  try {
    const { address, ownerName, leadId } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ADDRESS',
          message: 'Property address is required for verification.'
        }
      });
    }
    
    // Check user subscription and limits
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.'
        }
      });
    }
    
    // Check subscription and usage limits - Property verification requires at least basic plan
    const hasBasicSubscription = user.subscription && 
                                 user.subscription.status === 'active' && 
                                 ['basic', 'premium', 'enterprise'].includes(user.subscription.plan);
    
    if (!hasBasicSubscription) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'Basic or higher subscription required for property verification.'
        }
      });
    }
    
    // Get API integration for property data
    const propertyApi = await ApiIntegration.findOne({ 
      type: 'propertyData',
      isActive: true
    });
    
    if (!propertyApi) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'API_NOT_AVAILABLE',
          message: 'Property verification service is currently unavailable.'
        }
      });
    }
    
    // Check rate limiting
    if (propertyApi.isRateLimited()) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'API rate limit exceeded. Please try again later.'
        }
      });
    }
    
    // Call the property verification API
    try {
      // Log API call
      await propertyApi.logApiCall();
      
      // Mock API call for now (replace with actual API integration)
      const verificationResult = {
        foundProperty: Math.random() > 0.1, // 90% chance of finding property
        ownerMatches: ownerName ? Math.random() > 0.3 : false, // 70% chance of match if name provided
        ownerName: ownerName || 'Sample Owner',
        propertyType: ['Single Family', 'Multi Family', 'Condo', 'Land'][Math.floor(Math.random() * 4)],
        confidence: Math.floor(Math.random() * 30) + 70 // Random value between 70-100
      };
      
      // Create or update verification record
      let verification;
      
      if (leadId) {
        // Find the lead
        const lead = await Lead.findById(leadId);
        if (!lead) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'LEAD_NOT_FOUND',
              message: 'Lead not found.'
            }
          });
        }
        
        // Check if verification record exists
        verification = await Verification.findOne({ lead: leadId });
        
        if (verification) {
          // Update existing verification
          verification.addressVerification = {
            status: verificationResult.foundProperty ? 'valid' : 'invalid',
            provider: propertyApi.provider,
            verifiedAt: new Date(),
            details: {
              standardizedAddress: address, // In real implementation, this would be standardized
              city: 'Sample City', // Mock data
              state: 'Sample State',
              zipCode: '12345'
            },
            confidence: verificationResult.confidence
          };
          
          verification.ownershipVerification = {
            status: verificationResult.ownerMatches ? 'confirmed' : 'unconfirmed',
            provider: propertyApi.provider,
            verifiedAt: new Date(),
            details: {
              ownerName: verificationResult.ownerName,
              matchConfidence: verificationResult.confidence,
              propertyType: verificationResult.propertyType
            },
            confidence: verificationResult.confidence
          };
          
          await verification.save();
        } else {
          // Create new verification
          verification = new Verification({
            lead: leadId,
            user: req.userId,
            addressVerification: {
              status: verificationResult.foundProperty ? 'valid' : 'invalid',
              provider: propertyApi.provider,
              verifiedAt: new Date(),
              details: {
                standardizedAddress: address,
                city: 'Sample City', // Mock data
                state: 'Sample State',
                zipCode: '12345'
              },
              confidence: verificationResult.confidence
            },
            ownershipVerification: {
              status: verificationResult.ownerMatches ? 'confirmed' : 'unconfirmed',
              provider: propertyApi.provider,
              verifiedAt: new Date(),
              details: {
                ownerName: verificationResult.ownerName,
                matchConfidence: verificationResult.confidence,
                propertyType: verificationResult.propertyType
              },
              confidence: verificationResult.confidence
            }
          });
          await verification.save();
        }
        
        // Update lead status if verification is complete
        if ((verification.phoneVerification?.status === 'valid' || !verification.phoneVerification) &&
            verification.addressVerification.status === 'valid') {
          await Lead.findByIdAndUpdate(leadId, { 
            status: 'verified',
            score: verification.calculateScore()
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        message: 'Property verification completed.',
        data: {
          address: address,
          verificationResult: {
            foundProperty: verificationResult.foundProperty,
            ownerMatches: verificationResult.ownerMatches,
            ownerName: verificationResult.ownerName,
            propertyType: verificationResult.propertyType,
            confidence: verificationResult.confidence
          },
          verificationId: verification?._id
        }
      });
    } catch (apiError) {
      console.error('Property API error:', apiError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Error connecting to property verification service.'
        }
      });
    }
  } catch (error) {
    console.error('Property verification error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred during property verification.'
      }
    });
  }
});

// GET /api/verify/status/:leadId - Get verification status for a lead
router.get('/status/:leadId', auth, async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Validate lead ID format
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LEAD_ID',
          message: 'Invalid lead ID format.'
        }
      });
    }
    
    // Find lead and check ownership
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAD_NOT_FOUND',
          message: 'Lead not found.'
        }
      });
    }
    
    // Ensure user has access to this lead
    if (lead.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to access this lead.'
        }
      });
    }
    
    // Find verification record
    const verification = await Verification.findOne({ lead: leadId });
    
    if (!verification) {
      return res.status(200).json({
        success: true,
        message: 'No verification data found for this lead.',
        data: {
          leadId: leadId,
          status: 'not_verified',
          verifications: {}
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Verification status retrieved.',
      data: {
        leadId: leadId,
        status: lead.status,
        score: lead.score,
        verifications: {
          phone: verification.phoneVerification || { status: 'pending' },
          address: verification.addressVerification || { status: 'pending' },
          ownership: verification.ownershipVerification || { status: 'pending' }
        }
      }
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while retrieving verification status.'
      }
    });
  }
});

// Export the router
module.exports = router; 