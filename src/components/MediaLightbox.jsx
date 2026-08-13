import React, { useEffect, useRef } from "react";
import styles from "../pages/InternalPages.module.css";

export default function MediaLightbox({ item, onClose }) {
  const closeRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (!item) return undefined;
    previousFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-labelledby="lightbox-title" onMouseDown={onClose}>
      <div className={styles.lightboxPanel} onMouseDown={(event) => event.stopPropagation()}>
        <button ref={closeRef} type="button" className={styles.lightboxClose} onClick={onClose}>Close</button>
        <span className={styles.eyebrow}>{item.type}</span>
        <h2 id="lightbox-title">{item.title}</h2>
        <div className={styles.lightboxDiagram}>{item.detail}</div>
        <p>{item.caption}</p>
      </div>
    </div>
  );
}
