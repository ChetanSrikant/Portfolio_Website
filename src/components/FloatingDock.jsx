import React from "react";
import clsx from "clsx";
import { HOME_TARGETS, scrollToStageProgress } from "../config/home.js";
import styles from "./FloatingDock.module.css";

const DOCK_LINKS = [
  { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { label: "Work", action: () => scrollToStageProgress(HOME_TARGETS.work) },
  { label: "Contact", action: () => scrollToStageProgress(HOME_TARGETS.contact) },
];

export default function FloatingDock({ visible = false }) {
  return (
    <nav
      className={clsx(styles.dock, visible && styles.visible)}
      aria-label="Quick navigation"
      aria-hidden={!visible}
      inert={visible ? undefined : ""}
    >
      <span className={styles.identity} aria-hidden="true">
        CM
      </span>

      <div className={styles.actions}>
        {DOCK_LINKS.map((link) => (
          <button
            key={link.label}
            type="button"
            className={styles.action}
            onClick={link.action}
          >
            {link.label}
          </button>
        ))}

        <a
          href="/resume.pdf"
          className={styles.resume}
          target="_blank"
          rel="noreferrer"
          aria-label="Open Chetan Mandiga's résumé in a new tab"
        >
          Résumé
        </a>
      </div>
    </nav>
  );
}
