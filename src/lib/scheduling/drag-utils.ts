import { useCallback } from 'react';

type GenericFunction = (...args: any[]) => any;

export function useDragOptimization() {
 const throttle = useCallback(<T extends GenericFunction>(func: T, limit: number) => {
   let inThrottle: boolean = false;
   return (...args: Parameters<T>): ReturnType<T> | undefined => {
     if (!inThrottle) {
       const result = func(...args);
       inThrottle = true;
       setTimeout(() => { inThrottle = false; }, limit);
       return result;
     }
   };
 }, []);

 const debounce = useCallback(<T extends GenericFunction>(func: T, wait: number) => {
   let timeout: NodeJS.Timeout;
   return (...args: Parameters<T>): void => {
     clearTimeout(timeout);
     timeout = setTimeout(() => func(...args), wait);
   };
 }, []);

 return { throttle, debounce };
}

export const getSnapPosition = (y: number, cellHeight: number = 60) => {
 const cellPosition = Math.round(y / cellHeight) * cellHeight;
 return {
   hour: Math.floor(cellPosition / cellHeight) + 6,
   pixels: cellPosition
 };
};