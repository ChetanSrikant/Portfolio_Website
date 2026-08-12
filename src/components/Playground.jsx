import React, { useCallback, useEffect, useRef, useState } from "react";
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
const MOUSE_VELOCITY_THRESHOLD = 2.6;

export default function PlaygroundContent({ gundamApiRef, active }) {
  const [motionSupported, setMotionSupported] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionDenied, setMotionDenied] = useState(false);
  const [needsMotionPermission, setNeedsMotionPermission] = useState(false);
  const lastShakeRef = useRef(0);
  const lastMouse = useRef(null);

  const trigger = useCallback(
    (key) => {
      if (key === CLIPS.IDLE) gundamApiRef.current?.playIdle();
      else gundamApiRef.current?.play(key);
    },
    [gundamApiRef]
  );

  useEffect(() => {
    const supported =
      typeof window !== "undefined" && "DeviceMotionEvent" in window;
    setMotionSupported(supported);
    setNeedsMotionPermission(
      supported &&
        typeof window.DeviceMotionEvent.requestPermission === "function"
    );
  }, []);

  const enableMotion = async () => {
    setMotionDenied(false);
    if (needsMotionPermission) {
      try {
        const result = await window.DeviceMotionEvent.requestPermission();
        if (result === "granted") setMotionEnabled(true);
        else setMotionDenied(true);
      } catch {
        setMotionDenied(true);
      }
      return;
    }
    setMotionEnabled(true);
  };

  useEffect(() => {
    if (!active || !motionEnabled) return undefined;

    const onMotion = (event) => {
      const acceleration =
        event.accelerationIncludingGravity || event.acceleration;
      if (!acceleration) return;

      const magnitude =
        Math.abs(acceleration.x || 0) +
        Math.abs(acceleration.y || 0) +
        Math.abs(acceleration.z || 0);
      const now = performance.now();

      if (
        magnitude > SHAKE_ACCEL_THRESHOLD &&
        now - lastShakeRef.current > SHAKE_COOLDOWN_MS
      ) {
        lastShakeRef.current = now;
        trigger(CLIPS.BOOMERANG);
      }
    };

    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [active, motionEnabled, trigger]);

  useEffect(() => {
    if (!active) {
      lastMouse.current = null;
      return undefined;
    }

    const onMove = (event) => {
      if (event.buttons !== 0 || event.target.closest?.("button, a")) {
        lastMouse.current = null;
        return;
      }

      const now = performance.now();
      if (lastMouse.current) {
        const elapsed = now - lastMouse.current.time;
        if (elapsed > 0) {
          const distance = Math.hypot(
            event.clientX - lastMouse.current.x,
            event.clientY - lastMouse.current.y
          );
          const velocity = distance / elapsed;

          if (
            velocity > MOUSE_VELOCITY_THRESHOLD &&
            now - lastShakeRef.current > SHAKE_COOLDOWN_MS
          ) {
            lastShakeRef.current = now;
            trigger(CLIPS.BOOMERANG);
          }
        }
      }
      lastMouse.current = { x: event.clientX, y: event.clientY, time: now };
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [active, trigger]);

  return (
    <div className={styles.wrap}>
      <div className={styles.screenHeader} aria-hidden="true">
        <span>Control surface / live</span>
        <span>07 authored actions</span>
      </div>
      <div className={styles.label}>
        <span className="eyebrow">Gundam Playground</span>
        <p className={styles.hint}>
          Drag to inspect. Click for saber, double-click for shield, or choose
          an authored movement below.
        </p>
      </div>

      <div className={styles.dock} role="group" aria-label="Gundam movements">
        {MOVES.map((move) => (
          <button
            key={move.key}
            type="button"
            className={styles.control}
            onClick={() => trigger(move.key)}
          >
            {move.label}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.control} ${styles.controlAccent}`}
          onClick={() => trigger(CLIPS.BOOMERANG)}
        >
          Shake
        </button>
      </div>

      <div className={styles.utilityRow}>
        <button
          type="button"
          className={styles.utilityButton}
          onClick={() => gundamApiRef.current?.playIdle()}
        >
          Return to idle
        </button>
        <button
          type="button"
          className={styles.utilityButton}
          onClick={() => gundamApiRef.current?.resetRotation()}
        >
          Reset view
        </button>
      </div>

      {motionSupported && !motionEnabled && (
        <div className={styles.motionRow}>
          <span>
            {motionDenied
              ? "Motion access was not enabled. Explicit controls still work."
              : "Enable device motion for shake-to-throw."}
          </span>
          {!motionDenied && (
            <button
              type="button"
              className={styles.motionButton}
              onClick={enableMotion}
            >
              Enable motion
            </button>
          )}
        </div>
      )}
    </div>
  );
}
