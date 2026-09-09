import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./MediaLightbox.module.css";

function Icon({ name }) {
  const path = name === "close" ? <><path d="m6 6 12 12M18 6 6 18" /></> : name === "next" ? <path d="m9 5 7 7-7 7" /> : <path d="m15 5-7 7 7 7" />;
  return <svg viewBox="0 0 24 24" aria-hidden="true">{path}</svg>;
}

export default function MediaLightbox({ items = [], index = null, onIndexChange }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const previousFocus = useRef(null);
  const indexRef = useRef(index);
  const changeRef = useRef(onIndexChange);
  indexRef.current = index;
  changeRef.current = onIndexChange;
  const open = index !== null && Boolean(items[index]);
  const item = open ? items[index] : null;

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement;
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        changeRef.current(null);
        return;
      }
      if (event.key === "ArrowRight") changeRef.current((indexRef.current + 1) % items.length);
      if (event.key === "ArrowLeft") changeRef.current((indexRef.current - 1 + items.length) % items.length);
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = [...dialogRef.current.querySelectorAll(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
      )].filter((element) => !element.hasAttribute("hidden"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [items.length, open]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div ref={dialogRef} className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="lightbox-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onIndexChange(null); }}>
          <button ref={closeRef} className={`${styles.control} ${styles.close}`} type="button" onClick={() => onIndexChange(null)} aria-label="Close media viewer"><Icon name="close" /></button>
          {items.length > 1 && <>
            <button className={`${styles.control} ${styles.previous}`} type="button" onClick={() => onIndexChange((index - 1 + items.length) % items.length)} aria-label="Previous artifact"><Icon name="previous" /></button>
            <button className={`${styles.control} ${styles.next}`} type="button" onClick={() => onIndexChange((index + 1) % items.length)} aria-label="Next artifact"><Icon name="next" /></button>
          </>}
          <motion.figure key={item.title} className={styles.panel} initial={{ opacity: 0, scale: .97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }}>
            <span className={styles.type}>{item.type}</span>
            <h2 id="lightbox-title">{item.title}</h2>
            <div className={styles.diagram}>{item.detail}</div>
            <figcaption>{item.caption}</figcaption>
            <span className={styles.count}>{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
