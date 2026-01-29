// Custom hook for managing animated visibility state
// Handles the common pattern of isOpen (DOM presence) + isVisible (animation state)

import { useState, useEffect, useRef, useCallback } from "react";

interface UseAnimatedVisibilityOptions {
  /** Duration of the exit animation in milliseconds */
  exitDuration?: number;
}

interface UseAnimatedVisibilityReturn {
  /** Whether the element should be in the DOM */
  isOpen: boolean;
  /** Whether the element should be visible (for CSS transitions) */
  isVisible: boolean;
  /** Open the element with animation */
  open: () => void;
  /** Close the element with animation */
  close: () => void;
  /** Toggle the element */
  toggle: () => void;
}

export function useAnimatedVisibility(
  options: UseAnimatedVisibilityOptions = {}
): UseAnimatedVisibilityReturn {
  const { exitDuration = 200 } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  // Trigger visibility animation when opening
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const open = useCallback(() => {
    // Clear any pending close timer
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, exitDuration);
  }, [exitDuration]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    isVisible,
    open,
    close,
    toggle,
  };
}
