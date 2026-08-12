import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { HOME_TARGETS, scrollToStageProgress } from "../config/home.js";
import styles from "./Nav.module.css";

const LINKS = [
  { label: "Work", target: HOME_TARGETS.work },
  { label: "Philosophy", target: HOME_TARGETS.philosophy },
  { label: "Contact", target: HOME_TARGETS.contact },
];

export default function Nav({ visible = true }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setMenuOpen(false);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!visible) setMenuOpen(false);
  }, [visible]);

  const goHome = (event) => {
    event.preventDefault();
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStage = (target) => {
    setMenuOpen(false);
    scrollToStageProgress(target);
  };

  return (
    <nav
      className={clsx(
        styles.nav,
        scrolled && styles.scrolled,
        !visible && styles.navHidden
      )}
      aria-label="Primary navigation"
      aria-hidden={!visible}
      inert={visible ? undefined : ""}
    >
      <div className={styles.inner}>
        <a href="#top" className={styles.brand} onClick={goHome}>
          <span className={styles.monogram} aria-hidden="true">
            CM
          </span>
          <span className={styles.brandCopy}>
            <strong>Chetan Mandiga</strong>
            <small>AI developer · Product builder</small>
          </span>
        </a>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation-links"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        <div
          id="primary-navigation-links"
          className={clsx(styles.links, menuOpen && styles.linksOpen)}
        >
          {LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => goToStage(link.target)}
              className={styles.link}
            >
              {link.label}
            </button>
          ))}

          <a
            href="/resume.pdf"
            className={styles.resumeLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
            aria-label="Open Chetan Mandiga's résumé in a new tab"
          >
            Résumé
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
