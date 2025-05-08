/**
 * Counties Configuration
 * 
 * This file contains configurations for all supported counties in the FireCrawl service.
 * It includes mappings for county detection, API endpoints, and availability status.
 */

const counties = {
  // Texas
  harrisCounty: {
    name: 'Harris County',
    state: 'TX',
    cities: ['Houston'],
    zipPrefixes: ['77'],
    available: true,
    proOnly: false,
    baseUrl: 'https://hcad.org',
    propertySearchUrl: 'https://public.hcad.org/records/Real.asp',
    taxSearchUrl: 'https://www.hctax.net/Property/PropertyTax'
  },
  dallasCounty: {
    name: 'Dallas County',
    state: 'TX',
    cities: ['Dallas'],
    zipPrefixes: ['75'],
    available: true,
    proOnly: false,
    baseUrl: 'https://www.dallascad.org',
    propertySearchUrl: 'https://www.dallascad.org/SearchOwner.aspx'
  },
  // California
  losAngelesCounty: {
    name: 'Los Angeles County',
    state: 'CA',
    cities: ['Los Angeles', 'Long Beach', 'Glendale', 'Santa Clarita', 'Pasadena'],
    zipPrefixes: ['900', '901', '902', '903', '904', '905', '906', '907', '908'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://assessor.lacounty.gov',
    propertySearchUrl: 'https://assessor.lacounty.gov/online-property-search'
  },
  sanDiegoCounty: {
    name: 'San Diego County',
    state: 'CA',
    cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad'],
    zipPrefixes: ['919', '920', '921', '922'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://www.sandiegocounty.gov/content/sdc/ttc/tax-collection.html',
    propertySearchUrl: 'https://www.sdttc.com/content/ttc/en/tax-collection/secured-property-taxes/parcel-search.html'
  },
  // Florida
  miamiDadeCounty: {
    name: 'Miami-Dade County',
    state: 'FL',
    cities: ['Miami', 'Hialeah', 'Miami Beach', 'Homestead'],
    zipPrefixes: ['331', '332', '333', '334'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://www.miamidade.gov/pa/',
    propertySearchUrl: 'https://www.miamidade.gov/Apps/PA/propertysearch/'
  },
  // Illinois
  cookCounty: {
    name: 'Cook County',
    state: 'IL',
    cities: ['Chicago', 'Evanston', 'Schaumburg', 'Skokie'],
    zipPrefixes: ['606', '607', '608'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://www.cookcountyassessor.com',
    propertySearchUrl: 'https://www.cookcountyassessor.com/address-search'
  },
  // New York
  newYorkCounty: {
    name: 'New York County',
    state: 'NY',
    cities: ['New York', 'Manhattan'],
    zipPrefixes: ['100', '101', '102'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://www.nyc.gov/site/finance/taxes/property.page',
    propertySearchUrl: 'https://a836-pts-access.nyc.gov/care/search/commonsearch.aspx?mode=persprop'
  },
  // Washington
  kingCounty: {
    name: 'King County',
    state: 'WA',
    cities: ['Seattle', 'Bellevue', 'Kent', 'Renton'],
    zipPrefixes: ['980', '981', '982'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://kingcounty.gov/depts/assessor.aspx',
    propertySearchUrl: 'https://blue.kingcounty.com/Assessor/eRealProperty/default.aspx'
  },
  // Arizona
  maricopaCounty: {
    name: 'Maricopa County',
    state: 'AZ',
    cities: ['Phoenix', 'Mesa', 'Chandler', 'Scottsdale', 'Gilbert', 'Glendale', 'Tempe'],
    zipPrefixes: ['850', '851', '852', '853'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://mcassessor.maricopa.gov',
    propertySearchUrl: 'https://mcassessor.maricopa.gov/property-search/'
  },
  // Nevada
  clarkCounty: {
    name: 'Clark County',
    state: 'NV',
    cities: ['Las Vegas', 'Henderson', 'North Las Vegas'],
    zipPrefixes: ['889', '890', '891'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://www.clarkcountynv.gov/assessor',
    propertySearchUrl: 'https://www.clarkcountynv.gov/assessor/Pages/PropertyRecords.aspx'
  },
  // Colorado
  denverCounty: {
    name: 'Denver County',
    state: 'CO',
    cities: ['Denver'],
    zipPrefixes: ['802'],
    available: false,
    proOnly: true,
    comingSoon: true,
    baseUrl: 'https://www.denvergov.org/assessor',
    propertySearchUrl: 'https://www.denvergov.org/property'
  }
};

/**
 * Get all counties that are currently available and supported
 * @returns {Array} Array of county objects
 */
const getAvailableCounties = () => {
  return Object.keys(counties)
    .filter(key => counties[key].available)
    .map(key => ({
      id: key,
      ...counties[key]
    }));
};

/**
 * Get all counties that are coming soon (in development)
 * @returns {Array} Array of county objects
 */
const getComingSoonCounties = () => {
  return Object.keys(counties)
    .filter(key => counties[key].comingSoon)
    .map(key => ({
      id: key,
      ...counties[key]
    }));
};

/**
 * Get all counties (available and unavailable)
 * @returns {Array} Array of county objects
 */
const getAllCounties = () => {
  return Object.keys(counties).map(key => ({
    id: key,
    ...counties[key]
  }));
};

/**
 * Get county by ID
 * @param {string} id - County ID
 * @returns {Object} County object
 */
const getCountyById = (id) => {
  return counties[id] ? { id, ...counties[id] } : null;
};

/**
 * Determine county based on address components
 * @param {Object} addressComponents - Address components
 * @returns {string|null} - County ID or null if not found
 */
const determineCounty = (addressComponents) => {
  const { state, city, zip } = addressComponents;
  
  // First try exact matches by state and city
  if (state && city) {
    const stateNormalized = state.toLowerCase();
    const cityNormalized = city.toLowerCase();
    
    for (const countyId in counties) {
      const county = counties[countyId];
      
      // Check if state matches
      if (county.state.toLowerCase() === stateNormalized || 
          (stateNormalized === 'tx' && county.state.toLowerCase() === 'texas') || 
          (stateNormalized === 'ca' && county.state.toLowerCase() === 'california')) {
        
        // Check if city matches
        if (county.cities.some(countyCity => 
            cityNormalized.includes(countyCity.toLowerCase()))) {
          return countyId;
        }
      }
    }
  }
  
  // Then try by ZIP code
  if (zip) {
    for (const countyId in counties) {
      const county = counties[countyId];
      
      // Check if ZIP prefix matches
      if (county.zipPrefixes.some(prefix => zip.startsWith(prefix))) {
        return countyId;
      }
    }
  }
  
  return null;
};

module.exports = {
  counties,
  getAvailableCounties,
  getComingSoonCounties,
  getAllCounties,
  getCountyById,
  determineCounty
}; 