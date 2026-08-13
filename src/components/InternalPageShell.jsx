import React, { useEffect, useRef } from "react";
import Nav from "./Nav.jsx";
import Footer from "./Footer.jsx";
import styles from "../pages/InternalPages.module.css";

export function PageHero({ eyebrow, title, intro, meta, media }) {
  return (
    <header className={styles.pageHero}>
      <div className={media ? styles.heroGrid : styles.heroGridWide}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
          {meta && <span className={styles.heroMeta}>{meta}</span>}
        </div>
        {media && <div className={styles.heroMedia}>{media}</div>}
      </div>
    </header>
  );
}

export function SectionHeader({ eyebrow, title, copy }) {
  return (
    <header className={styles.sectionHeader}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </header>
  );
}

export function EditorialCTA({ eyebrow, title, copy, actions }) {
  return (
    <section className={styles.editorialCta}>
      <div>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      <div className={styles.ctaActions}>
        {actions.map((action, index) => (
          <a
            key={action.label}
            className={index === 0 ? styles.primaryAction : styles.secondaryAction}
            href={action.href}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
          >
            {action.label}
          </a>
        ))}
      </div>
    </section>
  );
}

export default function InternalPageShell({ children, title }) {
  const mainRef = useRef(null);

  useEffect(() => {
    document.title = `${title} | Chetan Mandiga`;
    const frame = window.requestAnimationFrame(() => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const target = hash ? document.getElementById(hash) : null;

      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.scrollIntoView({ block: "start" });
        target.focus({ preventScroll: true });
        return;
      }

      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [title]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Nav visible />
      <main id="main-content" ref={mainRef} className={styles.pageMain} tabIndex="-1">{children}</main>
      <Footer showGundamDisclaimer={false} />
    </>
  );
}
