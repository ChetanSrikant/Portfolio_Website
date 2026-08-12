import React from "react";
import SplitReveal from "./SplitReveal.jsx";
import { HOME_TARGETS, scrollToStageProgress } from "../config/home.js";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>AI · DEVELOPMENT · CREATIVE TECHNOLOGY</p>

          <SplitReveal
            as="h1"
            id="hero-title"
            className={styles.headline}
            text="I build intelligence into products."
            delay={0.1}
          />

          <p className={styles.sub}>
            I turn ambitious ideas into reliable software through applied AI,
            product thinking, and memorable interaction design.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => scrollToStageProgress(HOME_TARGETS.work)}
            >
              Explore my work
            </button>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => scrollToStageProgress(HOME_TARGETS.contact)}
            >
              Start a conversation
            </button>
          </div>
        </div>

        <figure className={styles.portraitFrame}>
          <div className={styles.portraitIndex} aria-hidden="true">
            PORTRAIT / 001
          </div>
          <img
            className={styles.portrait}
            src="/images/chetan-portrait.png"
            alt="Portrait of Chetan Mandiga"
            width="1024"
            height="1536"
            fetchpriority="high"
          />
          <figcaption className={styles.portraitCaption}>
            <span>Chetan Mandiga</span>
            <span>AI developer and product builder</span>
          </figcaption>
        </figure>
      </div>

      <div className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollLine} />
        Enter the machine world
      </div>

      <div className={styles.coords} aria-hidden="true">
        CURRENT MODE / BUILD
        <br />
        BASE / INDIA
      </div>
    </section>
  );
}
