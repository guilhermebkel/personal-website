import { useEffect, useRef, useState } from "react";

const IN_VIEW_THRESHOLD = 0.6;

// Why: an element that draws itself when seen only needs to know it was seen once, so the observer stops at the first sighting.
export const useInView = <T extends HTMLElement>(threshold = IN_VIEW_THRESHOLD) => {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [threshold]);
  return { ref, isVisible };
};
