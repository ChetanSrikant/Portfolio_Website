import React, { useEffect, useRef, useState } from "react";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./SystemIllustration.module.css";

export default function SystemIllustration({
  label,
  steps,
  status = "Verified workflow",
  compact = false,
}) {
  const rootRef = useRef(null);
  const [active, setActive] = useState(false);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const node = rootRef.current;
    if (!node || reducedMotion || !("IntersectionObserver" in window)) {
      setActive(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <figure
      ref={rootRef}
      className={`${styles.system} ${compact ? styles.compact : ""} ${active ? styles.active : ""}`}
      aria-label={`${label}: ${steps.join(" then ")}`}
    >
      <header className={styles.header}>
        <span>{label}</span>
        <span className={styles.status}><i aria-hidden="true" />{status}</span>
      </header>

      <div className={styles.flow} role="img" aria-hidden="true">
        {steps.map((step, index) => (
          <React.Fragment key={`${step}-${index}`}>
            <div className={styles.node} style={{ "--step": index }}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{step}</strong>
              <span>{index === steps.length - 1 ? "OUTPUT" : index === 0 ? "INPUT" : "PROCESS"}</span>
            </div>
            {index < steps.length - 1 ? (
              <span className={styles.connector} style={{ "--step": index }}>
                <i />
              </span>
            ) : null}
          </React.Fragment>
        ))}
      </div>

      <figcaption>
        <span>STATE / {active ? "COMPLETE" : "WAITING"}</span>
        <span>{steps.length} NODES</span>
      </figcaption>
    </figure>
  );
}
