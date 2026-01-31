// Shared hooks for common UI patterns

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================================
// useAnimatedVisibility - Modal/popup animation state management
// ============================================================================

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

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const open = useCallback(() => {
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

  return { isOpen, isVisible, open, close, toggle };
}

// ============================================================================
// useHover - Simple hover state management
// ============================================================================

interface UseHoverReturn {
  isHovered: boolean;
  hoverProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

export function useHover(): UseHoverReturn {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isHovered, hoverProps };
}

// ============================================================================
// useClickOutside - Detect clicks outside an element
// ============================================================================

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: (event: MouseEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler, enabled]);
}
