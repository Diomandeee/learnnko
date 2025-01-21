import { useCallback } from 'react';

export function useDragOptimization() {
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
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
