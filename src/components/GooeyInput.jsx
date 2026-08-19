import React, { useId, useState } from "react";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./GooeyInput.module.css";

export default function GooeyInput({
  value,
  defaultValue = "",
  placeholder = "Ask something unexpected...",
  disabled = false,
  maxLength = 500,
  onValueChange,
  onSubmit,
  submitLabel = "Send question",
  className = "",
}) {
  const filterId = `goo-${useId().replace(/:/g, "")}`;
  const reduced = useReducedMotionPreference();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [active, setActive] = useState(false);
  const controlled = value !== undefined;
  const currentValue = controlled ? value ?? "" : internalValue;

  const updateValue = (nextValue) => {
    if (!controlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <form
      className={`${styles.form} ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = currentValue.trim();
        if (trimmed) onSubmit?.(trimmed);
      }}
    >
      <svg className={styles.filter} aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className={styles.controls} style={!reduced && active ? { filter: `url(#${filterId})` } : undefined}>
        <div className={styles.inputShell}>
          <input
            type="text"
            value={currentValue}
            onChange={(event) => updateValue(event.target.value)}
            onFocus={() => setActive(true)}
            onBlur={() => setActive(false)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            aria-label={placeholder}
            autoComplete="off"
          />
          <span className={`${styles.signal} ${active && !reduced ? styles.signalActive : ""}`} aria-hidden="true" />
        </div>
        <button type="submit" disabled={disabled || !currentValue.trim()} aria-label={submitLabel}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m0 0-6 6m6-6 6 6" /></svg>
        </button>
      </div>
    </form>
  );
}
