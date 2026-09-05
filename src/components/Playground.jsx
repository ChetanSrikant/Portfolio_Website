import { useCallback, useEffect, useRef, useState } from "react";
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

export default function PlaygroundContent({ gundamApiRef, active }) {
  const [motionSupported, setMotionSupported] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionDenied, setMotionDenied] = useState(false);
  const [needsMotionPermission, setNeedsMotionPermission] = useState(false);
  const lastShakeRef = useRef(0);

  const trigger = useCallback(
    (key) => {
      if (!active) return;
      if (key === CLIPS.IDLE) gundamApiRef.current?.playIdle();
      else gundamApiRef.current?.play(key);
    },
    [active, gundamApiRef]
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
    if (!active) return;
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

  return (
    <div
      className={styles.wrap}
      style={{ pointerEvents: active ? "auto" : "none" }}
    >
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
            disabled={!active}
            onClick={() => trigger(move.key)}
          >
            {move.label}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.control} ${styles.controlAccent}`}
          disabled={!active}
          onClick={() => trigger(CLIPS.BOOMERANG)}
        >
          Shake
        </button>
      </div>

      <div className={styles.utilityRow}>
        <button
          type="button"
          className={styles.utilityButton}
          disabled={!active}
          onClick={() => gundamApiRef.current?.playIdle()}
        >
          Return to idle
        </button>
        <button
          type="button"
          className={styles.utilityButton}
          disabled={!active}
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
              disabled={!active}
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
