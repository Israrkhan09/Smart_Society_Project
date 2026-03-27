import { useEffect } from "react";

/**
 * useScrollLock
 * Disables body scroll when `active` is true (modal open).
 * Automatically restores scroll on cleanup.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [active]);
}
