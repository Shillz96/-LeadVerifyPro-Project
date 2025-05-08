/**
 * Property Analysis Routes
 * Endpoints for property condition analysis using computer vision
 */
const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const computerVisionService = require('../services/computerVisionService');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/property-analysis/assess-condition
 * @desc    Analyze property images to assess condition
 * @access  Private
 */
router.post('/assess-condition', auth, async (req, res) => {
  try {
    const { leadId, propertyAddress, forceRefresh } = req.body;
    
    // Validate required parameters
    if (!leadId && !propertyAddress) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'Either leadId or propertyAddress is required'
        }
      });
    }
    
    // Get or create the lead record
    let lead;
    if (leadId) {
      lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ 
          success: false, 
          error: {
            message: 'Lead not found'
          }
        });
      }
      
      // Check if the lead belongs to the current user
      if (lead.user.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          error: {
            message: 'Not authorized to access this lead'
          }
        });
      }
    }
    
    // Get address from lead if not provided directly
    const address = propertyAddress || lead.address;
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'Property address is required for analysis'
        }
      });
    }
    
    // Get property images from various sources
    const images = await computerVisionService.getPropertyImages(address);
    
    if (images.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: 'No images found for this property'
        }
      });
    }
    
    // Analyze the images using computer vision
    const visionResults = await computerVisionService.analyzeImages(images, {
      forceRefresh: forceRefresh || false
    });
    
    // If we have a lead ID, update the lead record with the results
    if (lead) {
      lead.propertyCondition = {
        condition: visionResults.condition,
        vacancyIndicators: visionResults.vacancyIndicators,
        repairNeeds: visionResults.repairNeeds,
        improvementPotential: visionResults.improvementPotential,
        imageUrls: images,
        analysisDate: new Date(),
        visuallyVerified: true
      };
      
      // Update the lead's score based on the condition assessment
      // This is a simple algorithm that can be enhanced later
      const baseScore = lead.score || 50;
      const conditionFactor = (100 - visionResults.condition.score) / 20; // 0-5 scale
      const vacancyFactor = 
        visionResults.vacancyIndicators.probability === 'high' ? 2 :
        visionResults.vacancyIndicators.probability === 'medium' ? 1 : 0;
      
      const newScore = Math.min(100, Math.max(0, 
        baseScore + (conditionFactor * 5) + (vacancyFactor * 10)
      ));
      
      lead.score = Math.round(newScore);
      
      await lead.save();
    }
    
    // Return the analysis results
    return res.status(200).json({
      success: true,
      data: {
        propertyAddress: address,
        images,
        analysis: visionResults,
        leadUpdated: !!lead
      }
    });
    
  } catch (error) {
    console.error('Error in property condition assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: {
        message: 'Server error while analyzing property condition'
      }
    });
  }
});

/**
 * @route   GET /api/property-analysis/:leadId
 * @desc    Get property analysis results for a lead
 * @access  Private
 */
router.get('/:leadId', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: 'Lead not found'
        }
      });
    }
    
    // Check if the lead belongs to the current user
    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: {
          message: 'Not authorized to access this lead'
        }
      });
    }
    
    // Check if the lead has property condition data
    if (!lead.propertyCondition || !lead.propertyCondition.visuallyVerified) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: 'No property analysis data available for this lead'
        }
      });
    }
    
    // Return the property condition data
    return res.status(200).json({
      success: true,
      data: {
        propertyAddress: lead.address,
        propertyCondition: lead.propertyCondition
      }
    });
    
  } catch (error) {
    console.error('Error fetching property analysis:', error);
    res.status(500).json({ 
      success: false, 
      error: {
        message: 'Server error while fetching property analysis'
      }
    });
  }
});

/**
 * @route   GET /api/property-analysis/image-sources/:address
 * @desc    Get available image sources for a property
 * @access  Private
 */
router.get('/image-sources/:address', auth, async (req, res) => {
  try {
    const address = req.params.address;
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'Property address is required'
        }
      });
    }
    
    // Get property images from various sources
    const images = await computerVisionService.getPropertyImages(address);
    
    return res.status(200).json({
      success: true,
      data: {
        propertyAddress: address,
        imageCount: images.length,
        images
      }
    });
    
  } catch (error) {
    console.error('Error getting property images:', error);
    res.status(500).json({ 
      success: false, 
      error: {
        message: 'Server error while fetching property images'
      }
    });
  }
});

module.exports = router; 