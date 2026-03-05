import { useRef, useState, useEffect, useCallback, CSSProperties } from 'react';

interface UseParallaxOptions {
  speed?: number; // < 1 = slower than scroll, > 1 = faster
  direction?: 'up' | 'down';
  disabled?: boolean;
}

export function useParallax({ speed = 0.3, direction = 'up', disabled = false }: UseParallaxOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    // Only calculate when element is near viewport
    if (rect.bottom < -200 || rect.top > windowHeight + 200) return;
    const centerOffset = rect.top - windowHeight / 2;
    const value = centerOffset * speed * (direction === 'up' ? 1 : -1);
    setOffset(value);
  }, [speed, direction, disabled]);

  useEffect(() => {
    if (disabled) return;
    // Use passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, disabled]);

  const style: CSSProperties = disabled ? {} : {
    transform: `translateY(${offset}px)`,
    willChange: 'transform',
    transition: 'transform 0.1s linear',
  };

  return { ref, style };
}

// Simplified hook for fade+slide on scroll
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
