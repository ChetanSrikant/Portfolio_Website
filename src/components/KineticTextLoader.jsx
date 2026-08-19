import React from "react";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./KineticTextLoader.module.css";

export default function KineticTextLoader({ text = "INITIALIZING", accessibleLabel = "Loading interactive experience", className = "" }) {
  const reduced = useReducedMotionPreference();
  return (
    <div className={`${styles.loader} ${reduced ? styles.reduced : ""} ${className}`} role="status" aria-live="polite" aria-label={accessibleLabel}>
      <span className={styles.srOnly}>{accessibleLabel}</span>
      <span className={styles.letters} aria-hidden="true">
        {text.split("").map((letter, index) => (
          <span key={`${letter}-${index}`} style={{ "--delay": `${index * 55}ms` }}>{letter === " " ? "\u00A0" : letter}</span>
        ))}
        <i />
      </span>
    </div>
  );
}
