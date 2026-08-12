import React from "react";
import styles from "./CTADock.module.css";

function scrollToStageProgress(fraction) {
  const wrapper = document.getElementById("gundam-wrapper");
  if (!wrapper) return;
  const total = wrapper.offsetHeight - window.innerHeight;
  const target = wrapper.offsetTop + total * fraction;
  window.scrollTo({ top: target, behavior: "smooth" });
}

export default function CTADockContent() {
  return (
    <div className={styles.wrap}>
      <h3 className={styles.headline}>Curious what else it can do?</h3>
      <div className={styles.row}>
        <a href="mailto:hello@chetan.dev" className={styles.primary}>
          Get in touch
        </a>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => scrollToStageProgress(0.42)}
        >
          Explore the work
        </button>
        <a href="/resume.pdf" className={styles.secondary}>
          View résumé
        </a>
        <span className={styles.secondary} data-disabled="true" title="Coming soon">
          Chat with the Gundam
        </span>
      </div>
    </div>
  );
}
