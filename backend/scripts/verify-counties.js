/**
 * County Configuration Verification Script
 * 
 * This script validates the counties configuration and provides a summary
 * of available and coming soon counties.
 * 
 * Run with: node scripts/verify-counties.js
 */

const countiesConfig = require('../services/firecrawl/config/counties');
const fireCrawlService = require('../services/firecrawl');

// Get all counties
const allCounties = countiesConfig.getAllCounties();
const availableCounties = countiesConfig.getAvailableCounties();
const comingSoonCounties = countiesConfig.getComingSoonCounties();
const countiesByState = fireCrawlService.getCountiesByState();

// Print summary
console.log('\n===== County Configuration Summary =====\n');
console.log(`Total Counties: ${allCounties.length}`);
console.log(`Available Counties: ${availableCounties.length}`);
console.log(`Coming Soon Counties: ${comingSoonCounties.length}`);
console.log(`States Covered: ${Object.keys(countiesByState).length}`);

// Print available counties
console.log('\n----- Available Counties -----');
availableCounties.forEach(county => {
  console.log(`${county.name}, ${county.state}${county.proOnly ? ' (Pro)' : ''}`);
});

// Print coming soon counties
console.log('\n----- Coming Soon Counties -----');
comingSoonCounties.forEach(county => {
  console.log(`${county.name}, ${county.state}${county.proOnly ? ' (Pro)' : ''}`);
});

// Print counties by state
console.log('\n----- Counties by State -----');
Object.keys(countiesByState).sort().forEach(state => {
  console.log(`\n${state}:`);
  countiesByState[state].forEach(county => {
    const status = county.available 
      ? 'Available' 
      : (county.comingSoon ? 'Coming Soon' : 'Unavailable');
    const proStatus = county.proOnly ? ' (Pro)' : '';
    console.log(`  - ${county.name}: ${status}${proStatus}`);
  });
});

// Validate configuration
console.log('\n===== Validation =====\n');

// Check for counties with no cities
const countiesWithNoCities = allCounties.filter(county => !county.cities || county.cities.length === 0);
if (countiesWithNoCities.length > 0) {
  console.log('WARNING: Counties with no cities defined:');
  countiesWithNoCities.forEach(county => {
    console.log(`  - ${county.name}, ${county.state}`);
  });
} else {
  console.log('✓ All counties have cities defined');
}

// Check for counties with no ZIP prefixes
const countiesWithNoZips = allCounties.filter(county => !county.zipPrefixes || county.zipPrefixes.length === 0);
if (countiesWithNoZips.length > 0) {
  console.log('WARNING: Counties with no ZIP prefixes defined:');
  countiesWithNoZips.forEach(county => {
    console.log(`  - ${county.name}, ${county.state}`);
  });
} else {
  console.log('✓ All counties have ZIP prefixes defined');
}

// Test county determination from address
console.log('\n----- County Determination Tests -----\n');

const testAddresses = [
  { address: '123 Main St', city: 'Houston', state: 'TX', zip: '77002' },
  { address: '456 Oak Ave', city: 'Dallas', state: 'TX', zip: '75201' },
  { address: '789 Pine Blvd', city: 'Los Angeles', state: 'CA', zip: '90001' },
  { address: '321 Elm St', city: 'Miami', state: 'FL', zip: '33101' },
  { address: '654 Maple Dr', city: 'Chicago', state: 'IL', zip: '60601' },
  { address: '987 Cedar Ln', city: 'New York', state: 'NY', zip: '10001' },
  { address: '258 Birch Rd', city: 'Seattle', state: 'WA', zip: '98101' },
  { address: '753 Spruce Way', city: 'Phoenix', state: 'AZ', zip: '85001' },
  { address: '159 Walnut Ct', city: 'Las Vegas', state: 'NV', zip: '89101' },
  { address: '486 Cherry St', city: 'Denver', state: 'CO', zip: '80201' }
];

testAddresses.forEach(address => {
  const county = countiesConfig.determineCounty(address);
  const countyName = county ? countiesConfig.getCountyById(county)?.name : 'Unknown';
  console.log(`Address: ${address.address}, ${address.city}, ${address.state} ${address.zip}`);
  console.log(`Determined County: ${county ? county : 'None'} (${countyName})`);
  console.log('---');
});

console.log('\nVerification complete!'); 