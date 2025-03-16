
import { useEffect, useState } from 'react';

export const useAnimatedNumber = (
  targetValue: number,
  duration: number = 1000,
  easingFn: (t: number) => number = easeOutCubic
) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startValue = displayValue;
    const valueToAnimate = targetValue - startValue;
    const startTime = Date.now();
    
    const animateValue = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      const newValue = startValue + valueToAnimate * easedProgress;
      setDisplayValue(newValue);
      
      if (progress < 1) {
        requestAnimationFrame(animateValue);
      }
    };
    
    requestAnimationFrame(animateValue);
  }, [targetValue]);

  return displayValue;
};

// Easing functions
export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t);
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeOutElastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// Staggered animation for lists
export interface StaggeredAnimationItem {
  key: string | number;
  delay: number;
}

export const useStaggeredAnimation = (
  items: (string | number)[],
  baseDelay: number = 50,
  staggerAmount: number = 50
): StaggeredAnimationItem[] => {
  return items.map((item, index) => ({
    key: item,
    delay: baseDelay + index * staggerAmount,
  }));
};

// For animated entrance of elements
export const useAnimatedEntrance = (
  delay: number = 0,
  duration: number = 500
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
  };

  return style;
};

// For smooth transitions between values
export const useTransition = <T>(value: T, duration: number = 300): T => {
  const [transitionValue, setTransitionValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTransitionValue(value);
    }, 0);

    return () => clearTimeout(timeout);
  }, [value]);

  return transitionValue;
};

// For pulse animations
export const usePulseAnimation = (
  trigger: any,
  duration: number = 300
): boolean => {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    setIsPulsing(true);
    const timeout = setTimeout(() => {
      setIsPulsing(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [trigger, duration]);

  return isPulsing;
};
