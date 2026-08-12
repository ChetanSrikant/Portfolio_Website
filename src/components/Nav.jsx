import React, { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./Nav.module.css";

// The Gundam stage is a single pinned (position: sticky) viewport, so a
// plain #anchor jump can't land mid-scroll — instead we scroll to the pixel
// offset that corresponds to a given narrative progress fraction.
function scrollToStageProgress(fraction) {
  const wrapper = document.getElementById("gundam-wrapper");
  if (!wrapper) return;
  const total = wrapper.offsetHeight - window.innerHeight;
  const target = wrapper.offsetTop + total * fraction;
  window.scrollTo({ top: target, behavior: "smooth" });
}

const LINKS = [
  { label: "Work", action: () => scrollToStageProgress(0.42) },
  { label: "Philosophy", action: () => scrollToStageProgress(0.22) },
  { label: "Contact", action: () => scrollToStageProgress(0.83) },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={clsx(styles.nav, scrolled && styles.scrolled)}>
      <a
        href="#top"
        className={styles.mark}
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <span className={styles.markDot} />
        CHETAN
      </a>
      <div className={styles.links}>
        {LINKS.map((l) => (
          <button
            key={l.label}
            type="button"
            onClick={l.action}
            className={styles.link}
            style={{ background: "none", border: "none", padding: 0 }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
