import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "../../pages/AboutPage.module.css";

export function StoryWorkspace({ label, meta, children, className = "" }) {
  return (
    <div className={`${styles.storyWorkspace} ${className}`}>
      <div className={styles.workspaceBar} aria-hidden="true">
        <span>{label}</span>
        <span>{meta}</span>
      </div>
      <div className={styles.workspaceBody}>{children}</div>
    </div>
  );
}

export function ContextChips({ items, label = "Context" }) {
  return (
    <ul className={styles.contextChips} aria-label={label}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function ChapterTabs({ chapters, activeId, onNavigate }) {
  return (
    <nav className={styles.chapterTabs} aria-label="About page chapters">
      <div className={styles.chapterTabsTrack}>
        {chapters.map((chapter) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            className={activeId === chapter.id ? styles.chapterTabActive : undefined}
            aria-current={activeId === chapter.id ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(chapter.id);
            }}
          >
            {chapter.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ArtifactViewer({ artifact, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!artifact) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll("button, a, video[controls], [tabindex]:not([tabindex='-1'])");
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

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [artifact, onClose]);

  if (!artifact) return null;

  return createPortal(
    <div
      className={styles.viewerBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={styles.artifactViewer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="artifact-viewer-title"
      >
        <header className={styles.viewerHeader}>
          <div>
            <span>{artifact.context}</span>
            <h2 id="artifact-viewer-title">{artifact.title}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close artifact viewer">Close</button>
        </header>
        <div className={styles.viewerMedia}>
          {artifact.type === "video" ? (
            <video src={artifact.src} controls playsInline preload="metadata" aria-label={artifact.alt} />
          ) : (
            <img src={artifact.src} alt={artifact.alt} />
          )}
        </div>
        <p>{artifact.description}</p>
      </section>
    </div>,
    document.body,
  );
}

export function ArtifactRail({ artifacts }) {
  const railRef = useRef(null);
  const dragRef = useRef({ active: false, x: 0, left: 0, moved: 0 });
  const [selected, setSelected] = React.useState(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    const onWheel = (event) => {
      if (window.innerWidth < 768 || rail.scrollWidth <= rail.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, []);

  const finishDrag = (event) => {
    dragRef.current.active = false;
    railRef.current?.releasePointerCapture?.(event.pointerId);
    railRef.current?.removeAttribute("data-dragging");
  };

  return (
    <>
      <div
        ref={railRef}
        className={styles.artifactRail}
        role="list"
        aria-label="Personal story artifacts"
        onPointerDown={(event) => {
          if (event.pointerType === "touch") return;
          dragRef.current = { active: true, x: event.clientX, left: event.currentTarget.scrollLeft, moved: 0 };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.setAttribute("data-dragging", "true");
        }}
        onPointerMove={(event) => {
          if (!dragRef.current.active) return;
          dragRef.current.moved = Math.abs(event.clientX - dragRef.current.x);
          event.currentTarget.scrollLeft = dragRef.current.left - (event.clientX - dragRef.current.x);
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        {artifacts.map((artifact, index) => (
          <div key={artifact.title} role="listitem" className={styles.artifactItem}>
            <button
              type="button"
              className={styles.artifactCard}
              onClick={() => {
                if (dragRef.current.moved < 8) setSelected(artifact);
              }}
              aria-label={`Open ${artifact.title}`}
            >
              <span className={styles.artifactMedia}>
                {artifact.type === "video" ? (
                  <video src={artifact.src} muted playsInline preload="metadata" aria-hidden="true" />
                ) : (
                  <img src={artifact.src} alt="" loading="lazy" style={{ objectPosition: artifact.position }} />
                )}
              </span>
              <span className={styles.artifactCaption}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{artifact.title}</strong>
                <i aria-hidden="true">Open</i>
              </span>
            </button>
          </div>
        ))}
      </div>
      <ArtifactViewer artifact={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export function LessonFold({ title, children }) {
  return (
    <details className={styles.lessonFold}>
      <summary>
        <span>{title}</span>
        <i aria-hidden="true">+</i>
      </summary>
      <div className={styles.lessonFoldBody}>{children}</div>
    </details>
  );
}
