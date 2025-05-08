"use client";

import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export const ScrollProgress = ({
  position = "top",
  color = "bg-primary",
  height = 2,
  className,
  ...props
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      
      if (scrollHeight > 0) {
        const percentage = (currentProgress / scrollHeight) * 100;
        setScrollProgress(percentage);
      }
    };

    // Update scroll progress on mount
    updateScrollProgress();

    // Add scroll event listener
    window.addEventListener("scroll", updateScrollProgress);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  const positions = {
    top: "top-0 left-0",
    bottom: "bottom-0 left-0",
    left: "left-0 top-0 h-full w-1",
    right: "right-0 top-0 h-full w-1",
  };

  const styles = position === 'left' || position === 'right' 
    ? { height: `${scrollProgress}%` }
    : { width: `${scrollProgress}%` };

  return (
    <div 
      className={cn(
        "fixed z-50 w-full", 
        position === 'left' || position === 'right' ? 'h-full w-1' : `h-[${height}px]`, 
        positions[position], 
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full", color)}
        style={styles}
      />
    </div>
  );
};

export default ScrollProgress; 