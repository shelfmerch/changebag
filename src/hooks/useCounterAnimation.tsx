import { useState, useEffect } from 'react';

interface UseCounterAnimationProps {
  target: number;
  duration?: number;
  isTriggered?: boolean;
}

export function useCounterAnimation({
  target,
  duration = 2000,
  isTriggered = false,
}: UseCounterAnimationProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isTriggered) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
      
      setCurrent(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isTriggered]);

  return current;
}
