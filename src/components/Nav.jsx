import React, { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./Nav.module.css";

const LINKS = [
  { label: "About", href: "/about" },
  { label: "Work", href: "/work" },
  { label: "Projects", href: "/projects" },
  { label: "Beyond", href: "/beyond" },
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
    setMenuOpen(false);
    if (window.location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
        <a href="/" className={styles.brand} onClick={goHome}>
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
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={styles.link}
              aria-current={window.location.pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </a>
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
