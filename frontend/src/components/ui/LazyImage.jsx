import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * LazyImage component for optimized image loading
 * Provides placeholder, lazy loading, and fade-in effects
 * 
 * @component
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  placeholderColor = '#f3f4f6',
  onLoad = () => {} 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  
  useEffect(() => {
    // Create a new image object to preload the image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
      setCurrentSrc(src);
      onLoad();
    };
    
    return () => {
      // Clean up
      img.onload = null;
    };
  }, [src, onLoad]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ 
        backgroundColor: placeholderColor,
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

LazyImage.propTypes = {
  /** Image source URL */
  src: PropTypes.string.isRequired,
  /** Alt text for accessibility */
  alt: PropTypes.string.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Image width in pixels */
  width: PropTypes.number,
  /** Image height in pixels */
  height: PropTypes.number,
  /** Background color to show while loading */
  placeholderColor: PropTypes.string,
  /** Callback function when image loads */
  onLoad: PropTypes.func,
};

export default LazyImage; 