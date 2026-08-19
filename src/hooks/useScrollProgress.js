import { useEffect, useRef } from "react";

/**
 * Tracks normalized progress through the sticky Gundam wrapper without
 * scheduling a React render for every scroll event. High-frequency consumers
 * read the returned ref; semantic UI updates belong in `onProgress`.
 */
export default function useScrollProgress(wrapperRef, onProgress) {
  const progressRef = useRef(0);
  const callbackRef = useRef(onProgress);

  useEffect(() => {
    callbackRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    let frame = 0;
    let initialized = false;
    let wrapperTop = 0;
    let scrollableDistance = 1;

    const measure = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      wrapperTop = wrapper.offsetTop;
      scrollableDistance = Math.max(1, wrapper.offsetHeight - window.innerHeight);
    };

    const update = () => {
      frame = 0;
      const value = Math.min(
        1,
        Math.max(0, (window.scrollY - wrapperTop) / scrollableDistance)
      );
      if (initialized && Math.abs(progressRef.current - value) < 0.0002) return;
      initialized = true;
      progressRef.current = value;
      callbackRef.current?.(value);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handleResize = () => {
      measure();
      requestUpdate();
    };

    measure();
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
    };
  }, [wrapperRef]);

  return progressRef;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
