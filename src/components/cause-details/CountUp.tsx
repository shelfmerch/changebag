
import React, { useState, useEffect } from 'react';

interface CountUpProps {
  target: number;
  duration?: number;
}

export const CountUp = ({ target, duration = 2000 }: CountUpProps) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    const animationId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationId);
  }, [target, duration]);
  
  return <>{count}</>;
};
