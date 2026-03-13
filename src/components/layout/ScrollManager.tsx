import { useEffect, useRef } from 'react';

interface ScrollManagerProps {
  currentPage: string;
  pageHistory: unknown[];
}

export function ScrollManager({ currentPage, pageHistory }: ScrollManagerProps) {
  const scrollPositions = useRef<Map<number, number>>(new Map());
  const previousHistoryLength = useRef(pageHistory.length);
  const previousPage = useRef(currentPage);

  useEffect(() => {
    const historyLength = pageHistory.length;
    const previousLength = previousHistoryLength.current;
    const isNavigatingBack = historyLength < previousLength;

    if (isNavigatingBack) {
      const savedPosition = scrollPositions.current.get(historyLength - 1);

      setTimeout(() => {
        window.scrollTo(0, savedPosition || 0);
      }, 0);
    } else {
      if (previousPage.current !== currentPage) {
        scrollPositions.current.set(previousLength - 1, window.scrollY);
      }

      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }

    previousHistoryLength.current = historyLength;
    previousPage.current = currentPage;
  }, [currentPage, pageHistory.length]);

  useEffect(() => {
    const saveScrollPosition = () => {
      const currentIndex = pageHistory.length - 1;
      scrollPositions.current.set(currentIndex, window.scrollY);
    };

    let timeoutId: number;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveScrollPosition, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [pageHistory.length]);

  return null;
}
