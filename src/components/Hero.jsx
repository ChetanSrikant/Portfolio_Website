import React from "react";
import SplitReveal from "./SplitReveal.jsx";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.grid} />

      <div className={styles.eyebrowRow}>
        <span className={styles.eyebrowLine} />
        <span className="eyebrow">Chetan — Software Engineer</span>
      </div>

      <SplitReveal
        as="h1"
        className={styles.headline}
        text="Building software that holds its ground."
        delay={0.1}
      />

      <p className={styles.sub}>
        Systems, tooling, and infrastructure work — with a twenty-meter
        mobile suit for a portfolio guide. Scroll to meet it.
      </p>

      <div className={styles.scrollCue}>
        <span className={styles.scrollLine} />
        Scroll
      </div>

      <div className={styles.coords}>
        UNIT — ZGMF-X09A
        <br />
        STATUS — STANDBY
      </div>
    </section>
  );
}
