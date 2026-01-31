// Reusable dropdown select component for calendar forms

import { useEffect, useRef, useState } from "react";
import tokens from "../../tokens";

interface DropdownProps {
  value: string | number;
  options: Array<{ label: string; value: string | number }>;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export function Dropdown({ value, options, onChange, disabled }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const transitionMs = 160;
  const containerRef = useRef<HTMLDivElement>(null);

  function openMenu() {
    if (disabled) return;
    setIsOpen(true);
    requestAnimationFrame(() => setIsVisible(true));
  }

  function closeMenu() {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), transitionMs);
  }

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (disabled && isOpen) {
      closeMenu();
    }
  }, [disabled, isOpen]);

  const selected = options.find((option) => option.value === value)?.label ?? String(value);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: tokens.radius.md,
          border: `1px solid ${tokens.colors.borderLight}`,
          backgroundColor: tokens.colors.surfaceSecondary,
          color: tokens.colors.text,
          fontFamily: tokens.fonts.elegant,
          fontSize: 14,
          outline: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          height: 40,
          lineHeight: "20px",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {selected}
      </button>
      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 5,
            maxHeight: 220,
            overflowY: "auto",
            backgroundColor: tokens.colors.surface,
            border: `1px solid ${tokens.colors.borderLight}`,
            borderRadius: tokens.radius.md,
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
            padding: 6,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-6px)",
            transition: `opacity ${transitionMs}ms ease, transform ${transitionMs}ms ease`,
            pointerEvents: isVisible ? "auto" : "none",
          }}
        >
          {options.map((option) => (
            <button
              key={`${option.value}`}
              type="button"
              onClick={() => {
                onChange(option.value);
                closeMenu();
              }}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: tokens.radius.sm,
                border: "none",
                backgroundColor:
                  option.value === value ? "rgba(212, 165, 116, 0.2)" : "transparent",
                color: option.value === value ? tokens.colors.accent : tokens.colors.text,
                fontFamily: tokens.fonts.elegant,
                fontSize: 14,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
