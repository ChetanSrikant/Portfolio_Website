import { useEffect, useRef, useState } from "react";

/**
 * Tracks scroll progress (0 → 1) through a tall wrapper element while it's
 * pinned via CSS `position: sticky`. This single progress value drives the
 * Gundam's position/rotation and the crossfade between overlay panels.
 */
export default function useScrollProgress(wrapperRef) {
  const [progress, setProgress] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const total = wrapper.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const scrolled = -rect.top;
        const p = Math.min(1, Math.max(0, scrolled / total));
        setProgress(p);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return progress;
}

/** Remaps a value from [inMin, inMax] to [outMin, outMax], clamped. */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
