import React, { useEffect, useRef, useState } from "react";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./LanguageSolarSystem.module.css";

const LANGUAGES = [
  { id:"python", mark:"PY", label:"Python", level:"Primary", description:"Applied AI, machine-learning experiments, APIs, and automation." },
  { id:"javascript", mark:"JS", label:"JavaScript", level:"Application", description:"Interactive interfaces, application behavior, and browser-based systems." },
  { id:"html", mark:"<>", label:"HTML", level:"Foundation", description:"Semantic structure that keeps interfaces understandable and accessible." },
  { id:"css", mark:"{}", label:"CSS", level:"Interface", description:"Responsive layout, visual systems, and purposeful interface motion." },
];

const ORBIT_POSITIONS = [
  { orbit:1, angle:24, duration:34 },
  { orbit:1, angle:204, duration:34 },
  { orbit:2, angle:112, duration:52 },
  { orbit:2, angle:292, duration:52 },
];

export default function LanguageSolarSystem({ languages = LANGUAGES }) {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(languages[0] ?? null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold:.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="language-system-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.copyTop}>
            <span className={styles.eyebrow}>Language system</span>
            <button type="button" className={styles.pauseButton} onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Resume orbit animation" : "Pause orbit animation"}>{paused ? "PLAY" : "PAUSE"}</button>
          </div>
          <h2 id="language-system-title">The languages in my current orbit.</h2>
          <p className={styles.intro}>Different tools, one objective: make the idea concrete enough to test. Only languages I actually use belong here.</p>
          <div className={styles.detail} aria-live="polite">
            {active && <><div className={styles.detailTop}><span>{String(languages.findIndex((item) => item.id === active.id) + 1).padStart(2,"0")}</span><span>{active.level}</span></div><div className={styles.detailIdentity}><span>{active.mark}</span><strong>{active.label}</strong></div><p>{active.description}</p></>}
          </div>
        </div>

        <div className={`${styles.system} ${visible && !paused && !reduced ? styles.running : ""}`} data-paused={paused || reduced}>
          <div className={`${styles.orbit} ${styles.orbitOne}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitTwo}`} aria-hidden="true" />
          <div className={styles.core} aria-hidden="true"><span /><strong>CHETAN</strong><small>BUILDER</small></div>
          {languages.map((language,index) => {
            const config = ORBIT_POSITIONS[index % ORBIT_POSITIONS.length];
            return <button key={language.id} type="button" className={`${styles.planet} ${active?.id === language.id ? styles.activePlanet : ""}`} style={{ "--angle":`${config.angle}deg`, "--counter-angle":`${-config.angle}deg`, "--distance":config.orbit === 1 ? "var(--orbit-one)" : "var(--orbit-two)", "--duration":`${config.duration}s`, "--delay":`${index * -5.5}s` }} onClick={() => setActive(language)} onFocus={() => setActive(language)} aria-pressed={active?.id === language.id} aria-label={`${language.label}: ${language.description}`}><span className={styles.planetInner}><strong>{language.mark}</strong><small>{language.label}</small></span></button>;
          })}
        </div>
      </div>
    </section>
  );
}
