import React, { useEffect, useRef, useState } from "react";
import styles from "./LanguageSolarSystem.module.css";

const LANGUAGES = [
  {
    id: "python",
    mark: "PY",
    label: "Python",
    level: "Primary",
    description: "Applied AI, machine-learning experiments, APIs, and automation.",
  },
  {
    id: "javascript",
    mark: "JS",
    label: "JavaScript",
    level: "Application",
    description: "Interactive interfaces, application behavior, and browser-based systems.",
  },
  {
    id: "html",
    mark: "HTML",
    label: "HTML",
    level: "Foundation",
    description: "Semantic structure that keeps interfaces understandable and accessible.",
  },
  {
    id: "css",
    mark: "CSS",
    label: "CSS",
    level: "Interface",
    description: "Responsive layout, visual systems, and purposeful interface motion.",
  },
];

const ORBIT_POSITIONS = [
  { orbit: 1, angle: 18, duration: 28 },
  { orbit: 2, angle: 112, duration: 42 },
  { orbit: 2, angle: 292, duration: 42 },
  { orbit: 3, angle: 205, duration: 58 },
];

function orbitDistance(orbit) {
  if (orbit === 1) return "var(--orbit-one)";
  if (orbit === 2) return "var(--orbit-two)";
  return "var(--orbit-three)";
}

export default function LanguageSolarSystem({ languages = LANGUAGES }) {
  const sectionRef = useRef(null);
  const [activeLanguage, setActiveLanguage] = useState(languages[0] ?? null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="language-system-title">
      <header className={styles.header}>
        <span className={styles.eyebrow}>// LANGUAGE SYSTEM</span>
        <h2 id="language-system-title" className={styles.heading}>The languages I build with.</h2>
        <p className={styles.intro}>Different tools orbit the same objective: building useful software.</p>
      </header>

      <div className={`${styles.system} ${isVisible ? styles.running : ""}`}>
        <div className={`${styles.orbit} ${styles.orbitOne}`} aria-hidden="true" />
        <div className={`${styles.orbit} ${styles.orbitTwo}`} aria-hidden="true" />
        <div className={`${styles.orbit} ${styles.orbitThree}`} aria-hidden="true" />

        <div className={styles.core} aria-hidden="true">
          <span className={styles.coreSignal} />
          <span className={styles.coreName}>CHETAN</span>
          <span className={styles.coreRole}>AI · DEVELOPER</span>
        </div>

        {languages.map((language, index) => {
          const config = ORBIT_POSITIONS[index % ORBIT_POSITIONS.length];
          return (
            <button
              key={language.id}
              type="button"
              className={`${styles.planet} ${activeLanguage?.id === language.id ? styles.activePlanet : ""}`}
              style={{
                "--angle": `${config.angle}deg`,
                "--counter-angle": `${config.angle * -1}deg`,
                "--distance": orbitDistance(config.orbit),
                "--duration": `${config.duration}s`,
                "--delay": `${index * -4.25}s`,
              }}
              onClick={() => setActiveLanguage(language)}
              onFocus={() => setActiveLanguage(language)}
              aria-pressed={activeLanguage?.id === language.id}
              aria-label={`${language.label}: ${language.description}`}
            >
              <span className={styles.planetInner}>
                <span className={styles.planetMark} aria-hidden="true">{language.mark}</span>
                <span className={styles.planetLabel}>{language.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.detail} aria-live="polite">
        {activeLanguage && (
          <>
            <div className={styles.detailTop}>
              <span className={styles.detailIndex}>
                {String(languages.findIndex((item) => item.id === activeLanguage.id) + 1).padStart(2, "0")}
              </span>
              <span>{activeLanguage.level}</span>
            </div>
            <strong className={styles.detailName}>{activeLanguage.label}</strong>
            <p className={styles.detailCopy}>{activeLanguage.description}</p>
          </>
        )}
      </div>
    </section>
  );
}
