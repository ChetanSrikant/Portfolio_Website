import React, { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./BackgroundBeams.module.css";

const BEAMS = [
  { left: "8%", delay: "0s", duration: "10s", width: 1 },
  { left: "19%", delay: "-4s", duration: "13s", width: 2 },
  { left: "31%", delay: "-7s", duration: "11s", width: 1 },
  { left: "46%", delay: "-2s", duration: "15s", width: 1 },
  { left: "58%", delay: "-9s", duration: "12s", width: 2 },
  { left: "73%", delay: "-5s", duration: "14s", width: 1 },
  { left: "87%", delay: "-8s", duration: "11s", width: 1 },
];

export default function BackgroundBeams({
  id,
  stageAnchor,
  eyebrow = "Building in the open",
  title = "I like building where AI, software, and imagination meet.",
  copy = "From experiments to usable products, I turn ideas into things people can actually interact with.",
}) {
  const sectionRef = useRef(null);
  const headingId = useId();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;

    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.08 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={styles.section}
      data-gundam-stage-anchor={stageAnchor}
      aria-labelledby={headingId}
    >
      <div
        className={clsx(styles.beams, active && styles.active)}
        aria-hidden="true"
      >
        <div className={styles.glow} />
        {BEAMS.map((beam, index) => (
          <span
            key={`${beam.left}-${index}`}
            className={styles.beam}
            style={{
              "--beam-left": beam.left,
              "--beam-delay": beam.delay,
              "--beam-duration": beam.duration,
              "--beam-width": `${beam.width}px`,
            }}
          />
        ))}
        <div className={styles.horizontalGlow} />
        <div className={styles.vignette} />
      </div>

      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          {eyebrow}
        </div>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        <p className={styles.copy}>{copy}</p>
      </div>
    </section>
  );
}
