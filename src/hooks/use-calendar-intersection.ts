import { useState, useEffect, useRef } from 'react';

interface UseCalendarIntersectionOptions {
 root?: Element | null;
 rootMargin?: string;
 threshold?: number | number[];
}

export function useCalendarIntersection(
 options: UseCalendarIntersectionOptions = {}
) {
 const [isIntersecting, setIntersecting] = useState(false);
 const targetRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
   const observer = new IntersectionObserver(([entry]) => {
     setIntersecting(entry.isIntersecting);
   }, {
     root: options.root || null,
     rootMargin: options.rootMargin || '0px',
     threshold: options.threshold || 0,
   });

   if (targetRef.current) {
     observer.observe(targetRef.current);
   }

   return () => observer.disconnect();
 }, [options.root, options.rootMargin, options.threshold]);

 return [targetRef, isIntersecting] as const;
}
