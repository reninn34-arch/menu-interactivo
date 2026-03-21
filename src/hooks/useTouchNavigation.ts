import { useRef } from 'react';
import React from 'react';

interface UseTouchNavigationOptions {
  itemCount: number;
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  threshold?: number;
}

interface TouchHandlers {
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Encapsulates touch swipe navigation logic for product carousels.
 * Swipe left → next item, Swipe right → previous item.
 * @param threshold - Minimum swipe distance in px to trigger navigation (default: 50)
 */
export const useTouchNavigation = ({
  itemCount,
  currentIndex,
  onNavigate,
  threshold = 50,
}: UseTouchNavigationOptions): TouchHandlers => {
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX; // Positive = swipe left (next)

    if (distance > threshold && currentIndex < itemCount - 1) {
      onNavigate(currentIndex + 1);
    } else if (distance < -threshold && currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
    touchStartX.current = null;
  };

  return { handleTouchStart, handleTouchEnd };
};
