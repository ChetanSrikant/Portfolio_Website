import React from "react";
import { HOME_TARGETS, scrollToStageProgress } from "../config/home.js";
import styles from "./CTADock.module.css";

export default function CTADockContent() {
  return (
    <div className={styles.wrap}>
      <span className="eyebrow">Ready for the next build?</span>
      <h3 className={styles.headline}>Let’s turn a hard problem into working software.</h3>
      <p className={styles.copy}>
        I work across applied AI, full-stack products, and production systems.
      </p>
      <div className={styles.row}>
        <a
          href="mailto:chetansrikantmandiga@gmail.com"
          className={styles.primary}
        >
          Get in touch
        </a>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => scrollToStageProgress(HOME_TARGETS.work)}
        >
          Replay the playground
        </button>
        <a
          href="/resume.pdf"
          className={styles.secondary}
          target="_blank"
          rel="noreferrer"
        >
          View résumé
        </a>
      </div>
    </div>
  );
}
