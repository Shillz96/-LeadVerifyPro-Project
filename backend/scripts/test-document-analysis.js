/**
 * Test Script for Document Analysis Service
 * 
 * This script tests the document fetch and analysis services
 * by fetching and analyzing documents for a test property.
 * 
 * Usage: node scripts/test-document-analysis.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.development' });

// Import services
const documentFetchService = require('../services/documentFetchService');
const documentAnalysisService = require('../services/documentAnalysisService');

// Test property information
const TEST_PROPERTY_ID = 'TEST-12345';
const TEST_COUNTY_ID = 'harris';

async function runTest() {
  console.log('======================================================');
  console.log('DOCUMENT ANALYSIS TEST');
  console.log('======================================================');
  
  try {
    // 1. Fetch documents
    console.log(`\nFetching documents for property ${TEST_PROPERTY_ID} in ${TEST_COUNTY_ID} county...`);
    const documents = await documentFetchService.getDocuments(
      TEST_PROPERTY_ID,
      TEST_COUNTY_ID,
      { forceRefresh: true }
    );
    
    console.log(`Retrieved ${documents.length} documents:`);
    documents.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.documentType}: ${doc.title} (${new Date(doc.recordingDate).toLocaleDateString()})`);
    });
    
    // 2. Analyze documents
    console.log('\nAnalyzing documents...');
    const analysisResults = await documentAnalysisService.analyzeDocuments(
      documents,
      { forceRefresh: true }
    );
    
    // 3. Print results
    console.log('\n======================================================');
    console.log('ANALYSIS RESULTS:');
    console.log('======================================================');
    
    console.log('\nLEGAL STATUS:');
    if (analysisResults.legalStatus) {
      Object.entries(analysisResults.legalStatus).forEach(([status, data]) => {
        console.log(`  ${status.toUpperCase()}: Probability ${(data.probability * 100).toFixed(1)}%`);
        console.log(`    Detected terms: ${data.matches.join(', ')}`);
      });
    } else {
      console.log('  No legal issues detected');
    }
    
    console.log('\nFINANCIAL INDICATORS:');
    if (analysisResults.financialIndicators && analysisResults.financialIndicators.length > 0) {
      analysisResults.financialIndicators.forEach(indicator => {
        console.log(`  ${indicator.category.toUpperCase()}: Strength ${(indicator.strength * 100).toFixed(1)}%`);
        console.log(`    Detected terms: ${indicator.matches.join(', ')}`);
      });
    } else {
      console.log('  No financial indicators detected');
    }
    
    console.log('\nMOTIVATION TERMS:');
    if (analysisResults.motivationTerms && analysisResults.motivationTerms.length > 0) {
      analysisResults.motivationTerms.forEach(term => {
        console.log(`  ${term.category.toUpperCase()}: Strength ${(term.strength * 100).toFixed(1)}%`);
        console.log(`    Detected terms: ${term.matches.join(', ')}`);
      });
    } else {
      console.log('  No motivation terms detected');
    }
    
    console.log('\nSENTIMENT ANALYSIS:');
    console.log(`  Document sentiment score: ${analysisResults.sentiment} (${getSentimentDescription(analysisResults.sentiment)})`);
    
    console.log('\nOVERALL SCORES:');
    console.log(`  Overall motivation score: ${analysisResults.motivationScore}/100`);
    console.log(`  Legal issues probability: ${(analysisResults.legalIssuesProbability * 100).toFixed(1)}%`);
    console.log(`  Analysis confidence: ${(analysisResults.confidence * 100).toFixed(1)}%`);
    
    console.log('\n======================================================');
    console.log('TEST COMPLETED SUCCESSFULLY');
    console.log('======================================================');
    
  } catch (error) {
    console.error('\nERROR DURING TEST:');
    console.error(error);
  }
}

/**
 * Get a human-readable description of a sentiment score
 * @param {number} score - Sentiment score (-5 to 5)
 * @returns {string} Description
 */
function getSentimentDescription(score) {
  if (score <= -4) return 'Extremely Negative';
  if (score <= -2) return 'Very Negative';
  if (score < 0) return 'Somewhat Negative';
  if (score === 0) return 'Neutral';
  if (score < 2) return 'Somewhat Positive';
  if (score < 4) return 'Very Positive';
  return 'Extremely Positive';
}

// Run the test
runTest(); 