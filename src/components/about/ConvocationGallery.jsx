import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference.js";
import styles from "./ConvocationGallery.module.css";
import ResponsiveImage from "../ResponsiveImage.jsx";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function getSpherePoints(count) {
  if (count === 1) return [{ x: 0, y: 0, z: 1 }];
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / (count - 1)) * 2;
    const horizontalRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = GOLDEN_ANGLE * index;
    return { x: Math.cos(angle) * horizontalRadius, y, z: Math.sin(angle) * horizontalRadius };
  });
}

function GalleryMedia({ item, eager = false, decorative = false }) {
  if (item.type === "video") {
    return (
      <video
        className={styles.media}
        src={item.src}
        muted={decorative}
        controls={!decorative}
        playsInline
        preload="metadata"
        aria-label={decorative ? undefined : item.alt}
        aria-hidden={decorative ? "true" : undefined}
      />
    );
  }
  return <ResponsiveImage className={styles.media} src={item.src} alt={decorative ? "" : item.alt} sizes={decorative ? "240px" : "(max-width: 720px) 100vw, 960px"} loading={eager ? "eager" : "lazy"} />;
}

function StaticGallery({ items, onSelect }) {
  return (
    <div className={styles.staticGallery}>
      {items.map((item, index) => (
        <button
          key={item.src}
          type="button"
          className={styles.staticItem}
          onClick={(event) => onSelect(index, event.currentTarget)}
          aria-label={`Open ${item.caption}`}
        >
          <GalleryMedia item={item} eager={index < 2} decorative />
          <span>{String(index + 1).padStart(2, "0")}</span>
        </button>
      ))}
    </div>
  );
}

export default function ConvocationGallery({ items, onClose }) {
  const dialogRef = useRef(null);
  const stageRef = useRef(null);
  const nodeRefs = useRef([]);
  const animationFrameRef = useRef(null);
  const lastFrameRef = useRef(null);
  const rotationRef = useRef({ x: -8, y: 12 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ id: null, x: 0, y: 0, distance: 0 });
  const pressedItemRef = useRef(null);
  const draggingRef = useRef(false);
  const interactionPausedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const selectedIndexRef = useRef(null);
  const selectedTriggerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const reducedMotion = useReducedMotionPreference();
  const spherePoints = useMemo(() => getSpherePoints(items.length), [items.length]);
  const [stageSize, setStageSize] = useState({ width: 900, height: 700 });
  const [dragging, setDragging] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const selectedItem = selectedIndex === null ? null : items[selectedIndex];

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);

  const openItem = useCallback((index, trigger) => {
    if (suppressClickRef.current) return;
    selectedTriggerRef.current = trigger;
    setSelectedIndex(index);
  }, []);

  const closeItem = useCallback(() => {
    setSelectedIndex(null);
    window.requestAnimationFrame(() => selectedTriggerRef.current?.focus());
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => current === null ? current : current === 0 ? items.length - 1 : current - 1);
  }, [items.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => current === null ? current : current === items.length - 1 ? 0 : current + 1);
  }, [items.length]);

  useEffect(() => {
    if (!stageRef.current || reducedMotion) return undefined;
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize({ width, height });
    });
    resizeObserver.observe(stageRef.current);
    return () => resizeObserver.disconnect();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const radius = Math.min(stageSize.width * 0.34, stageSize.height * 0.34, 330);

    const renderFrame = (time) => {
      const previousTime = lastFrameRef.current ?? time;
      const frameScale = Math.min((time - previousTime) / 16.67, 2);
      lastFrameRef.current = time;

      if (!draggingRef.current && !interactionPausedRef.current) {
        const velocity = velocityRef.current;
        rotationRef.current.x += velocity.x * frameScale;
        rotationRef.current.y += velocity.y * frameScale;
        const friction = Math.pow(0.94, frameScale);
        velocity.x *= friction;
        velocity.y *= friction;
        if (Math.abs(velocity.x) + Math.abs(velocity.y) < 0.04) rotationRef.current.y += 0.035 * frameScale;
      }

      const rotationX = rotationRef.current.x * (Math.PI / 180);
      const rotationY = rotationRef.current.y * (Math.PI / 180);
      const sinX = Math.sin(rotationX);
      const cosX = Math.cos(rotationX);
      const sinY = Math.sin(rotationY);
      const cosY = Math.cos(rotationY);

      spherePoints.forEach((point, index) => {
        const node = nodeRefs.current[index];
        if (!node) return;
        const rotatedY = point.y * cosX - point.z * sinX;
        const rotatedZ = point.y * sinX + point.z * cosX;
        const rotatedX = point.x * cosY + rotatedZ * sinY;
        const depth = -point.x * sinY + rotatedZ * cosY;
        const depthRatio = (depth + 1) / 2;
        const scale = 0.58 + depthRatio * 0.66;
        const opacity = 0.2 + depthRatio * 0.8;
        node.style.transform = `translate(-50%, -50%) translate3d(${rotatedX * radius}px, ${rotatedY * radius}px, 0) scale(${scale})`;
        node.style.opacity = String(opacity);
        node.style.zIndex = String(Math.round(depthRatio * 100));
        node.style.setProperty("--sphere-depth", String(depthRatio));
      });

      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    };

    lastFrameRef.current = null;
    animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(animationFrameRef.current);
  }, [reducedMotion, spherePoints, stageSize]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (selectedIndexRef.current !== null) closeItem();
        else onCloseRef.current();
        return;
      }
      if (selectedIndexRef.current !== null && event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }
      if (selectedIndexRef.current !== null && event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll("button, video[controls]")]
        .filter((element) => !element.disabled && element.tabIndex !== -1 && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeItem, showNext, showPrevious]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    if (!event.target.closest("button")) pressedItemRef.current = null;
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
    draggingRef.current = true;
    suppressClickRef.current = false;
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current || pointerRef.current.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerRef.current.x;
    const deltaY = event.clientY - pointerRef.current.y;
    pointerRef.current.x = event.clientX;
    pointerRef.current.y = event.clientY;
    pointerRef.current.distance += Math.hypot(deltaX, deltaY);
    if (pointerRef.current.distance > 5 && !dragging) {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    rotationRef.current.x -= deltaY * 0.18;
    rotationRef.current.y += deltaX * 0.24;
    velocityRef.current = { x: -deltaY * 0.18, y: deltaX * 0.24 };
  };

  const handlePointerEnd = (event) => {
    if (pointerRef.current.id !== event.pointerId) return;
    const wasDrag = pointerRef.current.distance > 5;
    const pressedItem = pressedItemRef.current;
    draggingRef.current = false;
    pointerRef.current.id = null;
    suppressClickRef.current = wasDrag;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!wasDrag && event.type === "pointerup" && pressedItem) openItem(pressedItem.index, pressedItem.trigger);
    pressedItemRef.current = null;
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
  };

  return (
    <div className={styles.backdrop}>
      <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="convocation-gallery-title" aria-describedby="convocation-gallery-instructions" tabIndex="-1">
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <span>Education archive</span>
            <h2 id="convocation-gallery-title">Convocation collection</h2>
            <small>{String(items.length).padStart(2, "0")} moments</small>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>Close</button>
        </header>

        {reducedMotion ? <StaticGallery items={items} onSelect={openItem} /> : (
          <div
            ref={stageRef}
            className={styles.sphereStage}
            data-dragging={dragging ? "true" : "false"}
            onPointerEnter={() => { interactionPausedRef.current = true; }}
            onPointerLeave={() => { interactionPausedRef.current = false; }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <div className={styles.orbit} aria-hidden="true" />
            {items.map((item, index) => (
              <button
                key={item.src}
                ref={(node) => { nodeRefs.current[index] = node; }}
                type="button"
                className={styles.sphereNode}
                onPointerEnter={() => { interactionPausedRef.current = true; }}
                onPointerLeave={() => { interactionPausedRef.current = false; }}
                onPointerDown={(event) => { pressedItemRef.current = { index, trigger: event.currentTarget }; }}
                onClick={(event) => { if (event.detail === 0) openItem(index, event.currentTarget); }}
                onFocus={() => { interactionPausedRef.current = true; }}
                onBlur={() => { interactionPausedRef.current = false; }}
                aria-label={`Open ${item.caption}`}
              >
                <GalleryMedia item={item} eager={index < 3} decorative />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        )}

        <footer className={styles.footer}>
          <p id="convocation-gallery-instructions">{reducedMotion ? "Select a moment to view it." : "Drag to rotate. Select a moment to view it."}</p>
          <span>BMU / Class of 2025</span>
        </footer>

        {selectedItem && (
          <div className={styles.spotlight} role="dialog" aria-modal="true" aria-label={selectedItem.caption}>
            <button type="button" className={styles.spotlightBackdrop} onClick={closeItem} aria-label="Close selected moment" />
            <div className={styles.spotlightContent}>
              <div className={styles.spotlightTopline}>
                <span>{String(selectedIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
                <button type="button" onClick={closeItem} autoFocus>Close</button>
              </div>
              <div className={styles.spotlightMedia}><GalleryMedia item={selectedItem} eager /></div>
              <div className={styles.spotlightFooter}>
                <p>{selectedItem.caption}</p>
                <div>
                  <button type="button" onClick={showPrevious}>Previous</button>
                  <button type="button" onClick={showNext}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
