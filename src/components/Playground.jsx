import React, { useEffect, useRef, useState } from "react";
import { CLIPS } from "./GundamModel.jsx";
import styles from "./Playground.module.css";

const MOVES = [
  { key: CLIPS.SABER, label: "Beam Saber" },
  { key: CLIPS.SHIELD, label: "Shield" },
  { key: CLIPS.RIFLE, label: "Rifle" },
  { key: CLIPS.BOOMERANG, label: "Boomerang" },
  { key: CLIPS.LIFTER, label: "Lifter" },
  { key: CLIPS.STATIC, label: "Hold Pose" },
];

const SHAKE_COOLDOWN_MS = 1100;
const SHAKE_ACCEL_THRESHOLD = 17;
const MOUSE_VELOCITY_THRESHOLD = 2.6; // px/ms

export default function PlaygroundContent({ gundamApiRef, active }) {
  const [motionSupported, setMotionSupported] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [needsMotionPermission, setNeedsMotionPermission] = useState(false);
  const lastShakeRef = useRef(0);
  const lastMouse = useRef(null);

  const trigger = (key) => {
    if (key === CLIPS.IDLE) gundamApiRef.current?.playIdle();
    else gundamApiRef.current?.play(key);
  };

  useEffect(() => {
    const supported = typeof window !== "undefined" && "DeviceMotionEvent" in window;
    setMotionSupported(supported);
    setNeedsMotionPermission(
      supported && typeof window.DeviceMotionEvent.requestPermission === "function"
    );
  }, []);

  const enableMotion = async () => {
    if (needsMotionPermission) {
      try {
        const res = await window.DeviceMotionEvent.requestPermission();
        if (res === "granted") setMotionEnabled(true);
      } catch {
        /* user declined — silently ignore */
      }
    } else {
      setMotionEnabled(true);
    }
  };

  // Real device shake, once permission is granted.
  useEffect(() => {
    if (!motionEnabled) return;
    const onMotion = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;
      const magnitude = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
      const now = Date.now();
      if (magnitude > SHAKE_ACCEL_THRESHOLD && now - lastShakeRef.current > SHAKE_COOLDOWN_MS) {
        lastShakeRef.current = now;
        trigger(CLIPS.BOOMERANG);
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motionEnabled]);

  // Desktop stand-in: rapid mouse movement while the Playground is in view.
  useEffect(() => {
    if (!active) return;
    const onMove = (e) => {
      const now = performance.now();
      if (lastMouse.current) {
        const dt = now - lastMouse.current.t;
        if (dt > 0) {
          const dist = Math.hypot(e.clientX - lastMouse.current.x, e.clientY - lastMouse.current.y);
          const velocity = dist / dt;
          if (
            velocity > MOUSE_VELOCITY_THRESHOLD &&
            now - lastShakeRef.current > SHAKE_COOLDOWN_MS
          ) {
            lastShakeRef.current = now;
            trigger(CLIPS.BOOMERANG);
          }
        }
      }
      lastMouse.current = { x: e.clientX, y: e.clientY, t: now };
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>
        <span className="eyebrow">Gundam Playground</span>
        <p className={styles.hint}>
          Click for saber, double-click for shield, shake your mouse (or
          phone) for the boomerang — or pick a move below.
        </p>
      </div>

      <div className={styles.dock}>
        {MOVES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={styles.pill}
            onClick={() => trigger(m.key)}
          >
            {m.label}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.pill} ${styles.pillAccent}`}
          onClick={() => trigger(CLIPS.BOOMERANG)}
        >
          Shake
        </button>
      </div>

      {motionSupported && !motionEnabled && (
        <div className={styles.motionRow}>
          Enable motion for real shake-to-throw on this device
          <button type="button" className={styles.motionButton} onClick={enableMotion}>
            Enable
          </button>
        </div>
      )}
    </div>
  );
}
