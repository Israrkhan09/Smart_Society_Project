import { useEffect } from "react";

/**
 * useScrollLock
 * Disables body scroll when `active` is true (modal open).
 * Automatically restores scroll on cleanup.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "contain";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = "auto";
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [active]);
}
