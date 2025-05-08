import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component for managing all meta tags, structured data, and canonical URLs
 */
const SEO = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  structuredData,
  canonicalUrl,
  noIndex = false,
  children
}) => {
  // Ensure title doesn't exceed recommended length (50-60 chars)
  const formattedTitle = title 
    ? `${title} | LeadVerifyPro` 
    : 'LeadVerifyPro - Verify and Analyze Real Estate Leads';

  // Ensure description doesn't exceed recommended length (150-160 chars)
  const formattedDescription = description?.length > 160
    ? `${description.substring(0, 157)}...`
    : description || 'Verify and analyze property leads with advanced data insights. Streamline your real estate investment workflow with LeadVerifyPro.';

  // Set default image if not provided
  const imageUrl = image || '/logo.png';
  
  // Create absolute URL for image
  const absoluteImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${window.location.origin}${imageUrl}`;

  // Create absolute URL for canonical link
  const absoluteCanonicalUrl = canonicalUrl 
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${window.location.origin}${canonicalUrl}`)
    : (url ? (url.startsWith('http') ? url : `${window.location.origin}${url}`) : window.location.href);

  // Default structured data for organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LeadVerifyPro",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-111-222-3333",
      "contactType": "customer service"
    }
  };

  // Merge default structured data with provided structured data
  const finalStructuredData = structuredData || defaultStructuredData;

  // Update document title on component mount and title change
  useEffect(() => {
    document.title = formattedTitle;
  }, [formattedTitle]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="title" content={formattedTitle} />
      <meta name="description" content={formattedDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={absoluteCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteCanonicalUrl} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={formattedDescription} />
      <meta property="og:image" content={absoluteImageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={absoluteCanonicalUrl} />
      <meta property="twitter:title" content={formattedTitle} />
      <meta property="twitter:description" content={formattedDescription} />
      <meta property="twitter:image" content={absoluteImageUrl} />
      
      {/* Robot directives */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* Additional elements passed as children */}
      {children}
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.arrayOf(PropTypes.string),
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  structuredData: PropTypes.object,
  canonicalUrl: PropTypes.string,
  noIndex: PropTypes.bool,
  children: PropTypes.node
};

export default SEO; 