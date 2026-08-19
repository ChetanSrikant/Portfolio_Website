import React, { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import styles from "./DriftWall.module.css";

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(items, seed) {
  const random = seededRandom(seed);
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

const DriftWall = forwardRef(function DriftWall({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  tilt = 16,
  turn = -14,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = "up",
  variance = 0.45,
  parallax = 0.6,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  overlayColor = "#060010",
  active = true,
  opacity = 1,
}, forwardedRef) {
  const wallRef = useRef(null);
  useImperativeHandle(forwardedRef, () => wallRef.current, []);
  const columnData = useMemo(
    () =>
      Array.from({ length: columns }, (_, columnIndex) => {
        const random = seededRandom(7403 + columnIndex * 997);
        const durationVariance = 1 + (random() * 2 - 1) * variance;

        return {
          items: shuffled(items, 1931 + columnIndex * 613),
          duration: Math.max(18, speed * durationVariance),
          delay: -speed * random(),
          depth: (random() * 2 - 1) * depth,
          lift: (random() * 2 - 1) * lift,
        };
      }),
    [columns, depth, items, lift, speed, variance]
  );

  useEffect(() => {
    if (!active || parallax === 0) return undefined;

    let frame = 0;
    const update = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * parallax * 26;
        const y = (event.clientY / window.innerHeight - 0.5) * parallax * 18;
        wallRef.current?.style.setProperty("--pointer-x", `${x}px`);
        wallRef.current?.style.setProperty("--pointer-y", `${y}px`);
      });
    };

    window.addEventListener("pointermove", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", update);
    };
  }, [active, parallax]);

  if (!items?.length) return null;

  return (
    <div
      ref={wallRef}
      className={styles.wall}
      data-active={active ? "true" : "false"}
      aria-hidden="true"
      style={{
        "--columns": columns,
        "--tile-width": `${tileWidth}px`,
        "--tile-height": `${tileHeight}px`,
        "--gap": `${gap}px`,
        "--tilt": `${tilt}deg`,
        "--turn": `${turn}deg`,
        "--perspective": `${perspective}px`,
        "--fade": fade,
        "--dim": dim,
        "--overlay": overlayColor,
        opacity,
      }}
    >
      <div className={styles.plane}>
        {columnData.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={styles.column}
            style={{
              "--column-duration": `${column.duration}s`,
              "--column-delay": `${column.delay}s`,
              "--column-depth": `${column.depth}px`,
              "--column-lift": `${column.lift}px`,
              "--column-direction": direction === "down" ? "reverse" : "normal",
            }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className={styles.group}>
                {column.items.map((item, itemIndex) => (
                  <figure key={`${copy}-${item.image}-${itemIndex}`} className={styles.tile}>
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      draggable="false"
                      style={{ objectPosition: item.focalPoint || "50% 50%" }}
                    />
                  </figure>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.scrim} />
    </div>
  );
});

export default memo(DriftWall);
