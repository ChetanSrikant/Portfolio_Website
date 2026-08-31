import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference.js";
import styles from "./ConvocationGallery.module.css";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function GalleryCard({ item, index, activeIndex, mouseX, mouseY, progress, stepX, stepY, stepZ, onSelect }) {
  const cardRef = useRef(null);
  const isActive = index === activeIndex;

  const distance = useTransform([mouseX, mouseY, progress], ([pointerX, pointerY]) => {
    if (!cardRef.current) return 500;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.hypot(pointerX - centerX, pointerY - centerY);
  });
  const targetScale = useTransform(distance, [0, 420], [1.24, 1]);
  const springScale = useSpring(targetScale, { mass: 0.45, stiffness: 280, damping: 24 });
  const transform = useTransform(springScale, (scale) => (
    `translate(-50%, -50%) translate3d(${index * stepX}px, ${index * stepY}px, ${index * stepZ}px) rotateY(-50deg) scale(${scale})`
  ));

  return (
    <motion.article
      ref={cardRef}
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      style={{ transform, transformStyle: "preserve-3d" }}
      aria-hidden={!isActive}
    >
      <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
      {item.type === "video" && isActive ? (
        <video
          className={styles.cardMedia}
          src={item.src}
          controls
          playsInline
          preload="metadata"
          aria-label={item.alt}
        />
      ) : (
        <button
          type="button"
          className={styles.cardButton}
          onClick={() => onSelect(index)}
          tabIndex={isActive ? 0 : -1}
          aria-label={`Select ${item.caption}`}
        >
          {item.type === "video" ? (
            <video className={styles.cardMedia} src={item.src} muted playsInline preload="metadata" aria-hidden="true" />
          ) : (
            <img
              className={styles.cardMedia}
              src={item.src}
              alt=""
              loading={index < 2 ? "eager" : "lazy"}
            />
          )}
        </button>
      )}
      <span className={styles.cardShade} aria-hidden="true" />
    </motion.article>
  );
}

function ReducedMotionGallery({ items }) {
  return (
    <div className={styles.staticGallery}>
      {items.map((item, index) => (
        <figure key={item.src} className={styles.staticItem}>
          {item.type === "video" ? (
            <video src={item.src} controls playsInline preload="metadata" aria-label={item.alt} />
          ) : (
            <img src={item.src} alt={item.alt} loading={index < 2 ? "eager" : "lazy"} />
          )}
          <figcaption>{item.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function ConvocationGallery({ items, onClose }) {
  const dialogRef = useRef(null);
  const touchStartX = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const [activeIndex, setActiveIndex] = useState(0);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, { mass: 0.16, stiffness: 110, damping: 22 });
  const mouseX = useMotionValue(-10000);
  const mouseY = useMotionValue(-10000);
  const stepX = compact ? 148 : 240;
  const stepY = compact ? -48 : -84;
  const stepZ = compact ? -205 : -288;
  const trackX = useTransform(smoothProgress, (value) => value * -stepX);
  const trackY = useTransform(smoothProgress, (value) => value * -stepY);
  const trackZ = useTransform(smoothProgress, (value) => value * -stepZ);
  const activeItem = items[activeIndex];

  const selectIndex = useCallback((index) => {
    const nextIndex = clamp(index, 0, items.length - 1);
    setActiveIndex(nextIndex);
    progress.set(nextIndex);
  }, [items.length, progress]);

  const showPrevious = useCallback(() => {
    selectIndex(activeIndex === 0 ? items.length - 1 : activeIndex - 1);
  }, [activeIndex, items.length, selectIndex]);

  const showNext = useCallback(() => {
    selectIndex(activeIndex === items.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, items.length, selectIndex]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleViewportChange = (event) => setCompact(event.matches);
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll("button, video[controls]")]
        .filter((element) => !element.disabled && element.tabIndex !== -1);
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
  }, [onClose, showNext, showPrevious]);

  const handleWheel = (event) => {
    if (reducedMotion || event.target.closest("video[controls]")) return;
    event.preventDefault();
    const nextProgress = clamp(progress.get() + event.deltaY / 520, 0, items.length - 1);
    progress.set(nextProgress);
    const nextIndex = Math.round(nextProgress);
    if (nextIndex !== activeIndex) setActiveIndex(nextIndex);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || event.target.closest("video")) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 48) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

  return (
    <div className={styles.backdrop}>
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="convocation-gallery-title"
        aria-describedby="convocation-gallery-instructions"
        tabIndex="-1"
        onWheel={handleWheel}
        onMouseMove={(event) => {
          if (reducedMotion) return;
          mouseX.set(event.clientX);
          mouseY.set(event.clientY);
        }}
        onMouseLeave={() => {
          mouseX.set(-10000);
          mouseY.set(-10000);
        }}
        onTouchStart={(event) => { touchStartX.current = event.changedTouches[0].clientX; }}
        onTouchEnd={handleTouchEnd}
      >
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <span>Education archive</span>
            <h2 id="convocation-gallery-title">Convocation<br />collection</h2>
            <small>({items.length})</small>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>Close</button>
        </header>

        {reducedMotion ? (
          <ReducedMotionGallery items={items} />
        ) : (
          <div className={styles.scene}>
            <motion.div
              className={styles.track}
              style={{ x: trackX, y: trackY, z: trackZ, transformStyle: "preserve-3d" }}
            >
              {items.map((item, index) => (
                <GalleryCard
                  key={item.src}
                  item={item}
                  index={index}
                  activeIndex={activeIndex}
                  mouseX={mouseX}
                  mouseY={mouseY}
                  progress={smoothProgress}
                  stepX={stepX}
                  stepY={stepY}
                  stepZ={stepZ}
                  onSelect={selectIndex}
                />
              ))}
            </motion.div>
          </div>
        )}

        {!reducedMotion && (
          <footer className={styles.footer}>
            <div className={styles.caption} aria-live="polite">
              <span>{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
              <p>{activeItem.caption}</p>
            </div>
            <p id="convocation-gallery-instructions" className={styles.instructions}>Wheel, swipe, or use the arrow keys</p>
            <div className={styles.controls}>
              <button type="button" onClick={showPrevious} aria-label="Show previous gallery item">Previous</button>
              <button type="button" onClick={showNext} aria-label="Show next gallery item">Next</button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}
