import { useEffect, RefObject } from "react";

/**
 * useScrollTrap
 * Traps mouse-wheel scroll inside the referenced container.
 * When the container reaches its top or bottom edge, the wheel
 * event is allowed to bubble up to the parent (natural chaining).
 */
export function useScrollTrap(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      const { scrollTop, scrollHeight, clientHeight } = el!;
      const atTop    = scrollTop <= 1          && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

      // Mid-scroll → keep event inside this container
      if (!atTop && !atBottom) {
        e.stopPropagation();
      }
      // At boundary → let it bubble naturally to page
    }

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref]);
}
