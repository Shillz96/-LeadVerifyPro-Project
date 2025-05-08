import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export const BorderBeam = ({
  duration = 2.5,
  size = 100,
  position = "center",
  className,
  ...props
}) => {
  const beamRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!beamRef.current || !containerRef.current) return;
    
    let animationFrameId;
    let startTime = Date.now();
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const beam = beamRef.current;
    
    const updatePosition = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % (duration * 1000)) / (duration * 1000);
      
      // Calculate the position based on progress
      const circumference = 2 * (rect.width + rect.height);
      const position = progress * circumference;
      
      let x, y;
      if (position < rect.width) {
        // Top edge
        x = position;
        y = 0;
      } else if (position < rect.width + rect.height) {
        // Right edge
        x = rect.width;
        y = position - rect.width;
      } else if (position < 2 * rect.width + rect.height) {
        // Bottom edge
        x = rect.width - (position - (rect.width + rect.height));
        y = rect.height;
      } else {
        // Left edge
        x = 0;
        y = rect.height - (position - (2 * rect.width + rect.height));
      }
      
      beam.style.left = `${x}px`;
      beam.style.top = `${y}px`;
      
      animationFrameId = requestAnimationFrame(updatePosition);
    };
    
    updatePosition();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [duration]);
  
  return (
    <div 
      ref={containerRef} 
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none", 
        className
      )} 
      {...props}
    >
      <div
        ref={beamRef}
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
      >
        <div 
          className="absolute inset-0 rounded-full bg-white blur-[6px] opacity-80"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </div>
  );
}; 