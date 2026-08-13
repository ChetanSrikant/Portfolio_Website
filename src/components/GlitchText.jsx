import React, { useEffect, useState } from "react";
import styles from "./GlitchText.module.css";

export default function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = false,
  triggerOn,
  className = "",
}) {
  const text = typeof children === "string" ? children : "";
  const speedValue = Math.max(0.2, Number(speed) || 1);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!triggerOn) return undefined;

    let timeoutId;
    const trigger = () => {
      setTriggered(false);
      requestAnimationFrame(() => setTriggered(true));
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setTriggered(false), 2200);
    };

    window.addEventListener(triggerOn, trigger);
    return () => {
      window.removeEventListener(triggerOn, trigger);
      clearTimeout(timeoutId);
    };
  }, [triggerOn]);

  return (
    <span
      className={[
        styles.glitch,
        enableShadows ? styles.shadows : "",
        enableOnHover ? styles.hoverOnly : styles.alwaysOn,
        triggered ? styles.triggered : "",
        className,
      ].filter(Boolean).join(" ")}
      data-text={text}
      tabIndex={enableOnHover ? 0 : undefined}
      style={{
        "--glitch-speed": `${speedValue}s`,
        "--glitch-speed-alt": `${speedValue * 1.13}s`,
      }}
    >
      {children}
    </span>
  );
}
