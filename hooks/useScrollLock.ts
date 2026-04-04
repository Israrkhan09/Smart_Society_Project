import { useEffect } from "react";

/**
 * useScrollLock
 * Disables body scroll when `active` is true (modal open).
 * Automatically restores scroll on cleanup.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const docHtml = document.documentElement;
    const docBody = document.body;
    
    // Save original values
    const originalScrollY = window.scrollY;
    const originalHtmlOverflow = docHtml.style.overflow;
    const originalBodyStyle = {
      overflow: docBody.style.overflow,
      position: docBody.style.position,
      top: docBody.style.top,
      width: docBody.style.width,
      paddingRight: docBody.style.paddingRight
    };

    // Prevent layout shift by calculating scrollbar width
    const scrollBarWidth = window.innerWidth - docHtml.clientWidth;

    // Apply strict "Fixed" lock with !important priority
    docHtml.style.setProperty("overflow", "hidden", "important");
    docBody.style.setProperty("overflow", "hidden", "important");
    docBody.style.position = "fixed";
    docBody.style.top = `-${originalScrollY}px`;
    docBody.style.width = "100%";
    
    if (scrollBarWidth > 0) {
      docBody.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      // Clear !important overrides
      docHtml.style.removeProperty("overflow");
      docBody.style.removeProperty("overflow");

      // Restore original styles
      docHtml.style.overflow = originalHtmlOverflow;
      docBody.style.overflow = originalBodyStyle.overflow;
      docBody.style.position = originalBodyStyle.position;
      docBody.style.top = originalBodyStyle.top;
      docBody.style.width = originalBodyStyle.width;
      docBody.style.paddingRight = originalBodyStyle.paddingRight;
      
      // Restore scroll position
      window.scrollTo(0, originalScrollY);
    };
  }, [active]);
}
