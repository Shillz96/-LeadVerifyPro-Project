/**
 * Lead scoring service for LeadVerifyPro
 * Implements a configurable scoring algorithm to rank leads based on multiple factors.
 */

const NodeCache = require('node-cache');

// Cache scoring results (TTL: 1 hour)
const scoreCache = new NodeCache({ stdTTL: 3600 });

/**
 * Scoring weights for different lead components
 * These can be customized based on client preference
 */
const DEFAULT_WEIGHTS = {
  // Quality of contact information
  contactQuality: 0.35,
  // Property information quality
  propertyQuality: 0.25,
  // Verification status
  verificationStatus: 0.25,
  // Ownership verification
  ownershipVerified: 0.15
};

/**
 * Scores the quality of contact information
 * @param {Object} lead Lead to score
 * @returns {Object} Score and details for contact information quality
 */
function scoreContactQuality(lead) {
  if (!lead) return { score: 0, details: { reason: 'No lead data' } };
  
  let score = 0;
  const details = {};
  
  // Score based on phone numbers
  if (lead.phoneNumbers && lead.phoneNumbers.length > 0) {
    // More phone numbers means higher score (up to 3)
    const phoneCount = Math.min(lead.phoneNumbers.length, 3);
    const phoneScore = phoneCount * 10;
    details.phoneNumbers = { score: phoneScore, count: phoneCount };
    score += phoneScore;
  } else {
    details.phoneNumbers = { score: 0, count: 0 };
  }
  
  // Score based on email
  if (lead.email && lead.email.trim()) {
    details.email = { score: 20, present: true };
    score += 20;
  } else {
    details.email = { score: 0, present: false };
  }
  
  // Score based on name completeness
  if (lead.name && lead.name.trim()) {
    let nameScore = 10; // Basic score for having a name
    
    // Additional points if we have first and last name separately
    if (lead.firstName && lead.lastName) {
      nameScore += 5;
    }
    
    details.name = { score: nameScore, complete: !!lead.firstName && !!lead.lastName };
    score += nameScore;
  } else {
    details.name = { score: 0, present: false };
  }
  
  // Normalize to 0-100 scale
  const normalizedScore = Math.min(Math.round(score), 100);
  
  return {
    score: normalizedScore,
    details
  };
}

/**
 * Scores the quality of property information
 * @param {Object} lead Lead to score
 * @returns {Object} Score and details for property quality
 */
function scorePropertyQuality(lead) {
  if (!lead) return { score: 0, details: { reason: 'No lead data' } };
  
  let score = 0;
  const details = {};
  
  // Score based on address completeness
  if (lead.address && lead.address.trim()) {
    let addressScore = 30; // Base score for having an address
    
    // Additional points for address components
    if (lead.verificationDetails && 
        lead.verificationDetails.addressVerification &&
        lead.verificationDetails.addressVerification.isValid) {
      addressScore += 20;
    }
    
    // Additional points for state and county
    if (lead.state && lead.state.trim()) {
      addressScore += 10;
    }
    
    if (lead.county && lead.county.trim()) {
      addressScore += 10;
    }
    
    details.address = { score: addressScore };
    score += addressScore;
  } else {
    details.address = { score: 0, present: false };
  }
  
  // Additional property data (if present)
  if (lead.rawData) {
    const propertyMetrics = extractPropertyMetrics(lead.rawData);
    details.propertyMetrics = propertyMetrics;
    score += propertyMetrics.score;
  }
  
  // Normalize to 0-100 scale
  const normalizedScore = Math.min(Math.round(score), 100);
  
  return {
    score: normalizedScore,
    details
  };
}

/**
 * Extract property metrics from raw data
 * @param {Object} rawData Raw lead data
 * @returns {Object} Property metrics and score
 */
function extractPropertyMetrics(rawData) {
  let metricsScore = 0;
  const metrics = {};
  
  // Check for various property fields that might be in the raw data
  // These field names are based on common real estate datasets
  
  // Check for property value
  const valueFields = ['Property Value', 'Value', 'Estimated Value', 'Price'];
  for (const field of valueFields) {
    if (rawData[field] && !isNaN(parseFloat(rawData[field]))) {
      metrics.value = parseFloat(rawData[field]);
      metricsScore += 15;
      break;
    }
  }
  
  // Check for property size
  const sizeFields = ['Square Feet', 'SqFt', 'Size', 'Building Size'];
  for (const field of sizeFields) {
    if (rawData[field] && !isNaN(parseFloat(rawData[field]))) {
      metrics.size = parseFloat(rawData[field]);
      metricsScore += 5;
      break;
    }
  }
  
  // Check for lot size
  const lotFields = ['Lot Size', 'Lot Area', 'Acreage'];
  for (const field of lotFields) {
    if (rawData[field] && !isNaN(parseFloat(rawData[field]))) {
      metrics.lotSize = parseFloat(rawData[field]);
      metricsScore += 5;
      break;
    }
  }
  
  // Check for year built
  const yearFields = ['Year Built', 'Built'];
  for (const field of yearFields) {
    if (rawData[field] && !isNaN(parseInt(rawData[field]))) {
      metrics.yearBuilt = parseInt(rawData[field]);
      metricsScore += 5;
      break;
    }
  }
  
  return {
    metrics,
    score: metricsScore
  };
}

/**
 * Scores the verification status of the lead
 * @param {Object} lead Lead to score
 * @returns {Object} Score and details for verification status
 */
function scoreVerificationStatus(lead) {
  if (!lead) return { score: 0, details: { reason: 'No lead data' } };
  
  let score = 0;
  const details = { status: lead.verificationStatus };
  
  // Score based on verification status
  switch (lead.verificationStatus) {
    case 'verified':
      score = 100;
      details.reason = 'All verification checks passed';
      break;
    case 'partially_verified':
      score = 50;
      details.reason = 'Some verification checks passed';
      break;
    case 'pending':
      score = 0;
      details.reason = 'Verification not completed';
      break;
    case 'failed':
      score = 0;
      details.reason = 'Verification failed';
      break;
    default:
      score = 0;
      details.reason = 'Unknown verification status';
  }
  
  // If we have verification details, factor them in
  if (lead.verificationDetails) {
    details.phoneVerified = lead.verificationDetails.phoneVerification && 
                          lead.verificationDetails.phoneVerification.isValid;
                          
    details.emailVerified = lead.verificationDetails.emailVerification && 
                          lead.verificationDetails.emailVerification.isValid;
                          
    details.addressVerified = lead.verificationDetails.addressVerification && 
                            lead.verificationDetails.addressVerification.isValid;
  }
  
  return {
    score,
    details
  };
}

/**
 * Scores the ownership verification status
 * @param {Object} lead Lead to score
 * @returns {Object} Score and details for ownership verification
 */
function scoreOwnershipVerification(lead) {
  if (!lead) return { score: 0, details: { reason: 'No lead data' } };
  
  const isOwnershipVerified = lead.ownershipVerified === true;
  
  return {
    score: isOwnershipVerified ? 100 : 0,
    details: {
      verified: isOwnershipVerified,
      reason: isOwnershipVerified ? 'Ownership verified' : 'Ownership not verified'
    }
  };
}

/**
 * Calculates an overall lead score based on multiple factors
 * @param {Object} lead Lead object to score
 * @param {Object} weights Optional custom weights for scoring components
 * @returns {Object} Overall score and component details
 */
function calculateLeadScore(lead, weights = DEFAULT_WEIGHTS) {
  if (!lead) {
    throw new Error('No lead data provided for scoring');
  }
  
  // Check cache first
  const cacheKey = `score_${lead._id}`;
  const cachedScore = scoreCache.get(cacheKey);
  if (cachedScore) {
    return cachedScore;
  }
  
  // Calculate component scores
  const contactScore = scoreContactQuality(lead);
  const propertyScore = scorePropertyQuality(lead);
  const verificationScore = scoreVerificationStatus(lead);
  const ownershipScore = scoreOwnershipVerification(lead);
  
  // Calculate weighted score
  const weightedScore = (
    (contactScore.score * weights.contactQuality) +
    (propertyScore.score * weights.propertyQuality) +
    (verificationScore.score * weights.verificationStatus) +
    (ownershipScore.score * weights.ownershipVerified)
  );
  
  // Round to whole number
  const finalScore = Math.round(weightedScore);
  
  // Determine lead category based on score
  let category;
  if (finalScore >= 80) {
    category = 'Hot';
  } else if (finalScore >= 50) {
    category = 'Warm';
  } else {
    category = 'Cold';
  }
  
  // Build score result
  const scoreResult = {
    score: finalScore,
    category,
    explanation: getScoreExplanation(finalScore, category),
    components: {
      contactQuality: {
        score: contactScore.score,
        weight: weights.contactQuality,
        weightedScore: Math.round(contactScore.score * weights.contactQuality),
        details: contactScore.details
      },
      propertyQuality: {
        score: propertyScore.score,
        weight: weights.propertyQuality,
        weightedScore: Math.round(propertyScore.score * weights.propertyQuality),
        details: propertyScore.details
      },
      verificationStatus: {
        score: verificationScore.score,
        weight: weights.verificationStatus,
        weightedScore: Math.round(verificationScore.score * weights.verificationStatus),
        details: verificationScore.details
      },
      ownershipVerified: {
        score: ownershipScore.score,
        weight: weights.ownershipVerified,
        weightedScore: Math.round(ownershipScore.score * weights.ownershipVerified),
        details: ownershipScore.details
      }
    },
    weightsUsed: weights
  };
  
  // Cache the result
  scoreCache.set(cacheKey, scoreResult);
  
  return scoreResult;
}

/**
 * Generates a human-readable explanation of the score
 * @param {number} score Calculated score
 * @param {string} category Score category (Hot/Warm/Cold)
 * @returns {string} Explanation text
 */
function getScoreExplanation(score, category) {
  if (score >= 80) {
    return `This is a high-quality ${category} lead with verified information. Recommended for immediate follow-up.`;
  } else if (score >= 60) {
    return `This is a good-quality ${category} lead with mostly verified information. Recommended for follow-up soon.`;
  } else if (score >= 40) {
    return `This is a moderate-quality ${category} lead with some verified information. Consider follow-up after higher-scoring leads.`;
  } else {
    return `This is a low-quality ${category} lead with minimal verified information. Not recommended for immediate follow-up.`;
  }
}

/**
 * Batch scores multiple leads
 * @param {Array<Object>} leads Array of lead objects to score
 * @param {Object} weights Optional custom weights for scoring components
 * @returns {Array<Object>} Array of scoring results
 */
function batchScoreLeads(leads, weights = DEFAULT_WEIGHTS) {
  if (!Array.isArray(leads)) {
    throw new Error('Expected an array of leads for batch scoring');
  }
  
  return leads.map(lead => calculateLeadScore(lead, weights));
}

/**
 * Clears scoring cache
 */
function clearCache() {
  scoreCache.flushAll();
  console.log('Score cache cleared');
}

module.exports = {
  calculateLeadScore,
  batchScoreLeads,
  scoreContactQuality,
  scorePropertyQuality,
  scoreVerificationStatus,
  scoreOwnershipVerification,
  DEFAULT_WEIGHTS,
  clearCache
}; 