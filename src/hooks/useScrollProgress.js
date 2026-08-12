import { useEffect, useState } from "react";

/** Tracks normalized progress through the sticky Gundam wrapper. */
export default function useScrollProgress(wrapperRef) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const total = wrapper.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      const value = Math.min(
        1,
        Math.max(0, -wrapper.getBoundingClientRect().top / total)
      );
      setProgress((current) =>
        Math.abs(current - value) > 0.0005 ? value : current
      );
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("scroll", update, { passive: true, capture: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
    };
  }, [wrapperRef]);

  return progress;
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
