import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        © {year} Chetan — fan-made ZGMF-X09A rig, not affiliated with
        Sunrise / Bandai.
      </div>
      <div className={styles.right}>
        <a className={styles.link} href="https://github.com" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className={styles.link} href="https://linkedin.com" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a className={styles.link} href="mailto:hello@chetan.dev">
          Email
        </a>
      </div>
    </footer>
  );
}
