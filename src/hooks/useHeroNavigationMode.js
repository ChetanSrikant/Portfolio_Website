import { useEffect, useState } from "react";
import { HERO_NAV_THRESHOLD } from "../config/home.js";

export default function useHeroNavigationMode() {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setCondensed(entry.intersectionRatio < HERO_NAV_THRESHOLD),
      { threshold: [0, HERO_NAV_THRESHOLD, 1] }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return condensed;
}
