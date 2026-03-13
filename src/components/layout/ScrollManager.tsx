import { useEffect, useRef } from 'react';

interface ScrollManagerProps {
  currentPage: string;
  pageHistory: unknown[];
}

export function ScrollManager({ currentPage, pageHistory }: ScrollManagerProps) {
  const scrollPositions = useRef<Map<number, number>>(new Map());
  const previousHistoryLength = useRef(pageHistory.length);
  const isNavigatingBack = useRef(false);

  useEffect(() => {
    const historyLength = pageHistory.length;
    const previousLength = previousHistoryLength.current;

    if (historyLength < previousLength) {
      isNavigatingBack.current = true;
    } else {
      isNavigatingBack.current = false;
    }

    previousHistoryLength.current = historyLength;

    if (isNavigatingBack.current) {
      const savedPosition = scrollPositions.current.get(historyLength - 1);

      if (savedPosition !== undefined) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }
    } else {
      const currentScrollPosition = window.scrollY;
      scrollPositions.current.set(previousLength - 1, currentScrollPosition);

      window.scrollTo(0, 0);
    }

    const handleBeforeUnload = () => {
      scrollPositions.current.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentPage, pageHistory.length]);

  return null;
}
