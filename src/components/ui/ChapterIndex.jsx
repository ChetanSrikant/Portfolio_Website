import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./ChapterIndex.module.css";

export default function ChapterIndex({ chapters }) {
  const [activeId, setActiveId] = useState(null);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter(Boolean);
    const firstSection = sections[0];
    const footer = document.querySelector("footer");

    const chapterObserver = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current) setActiveId(current.target.id);
      },
      { rootMargin: "-30% 0px -55%", threshold: [0, 0.25, 0.5, 0.75] }
    );

    const footerObserver = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );

    const updateHeroState = () => {
      setIsPastHero(Boolean(firstSection && firstSection.getBoundingClientRect().top <= 100));
    };

    sections.forEach((section) => chapterObserver.observe(section));
    if (footer) footerObserver.observe(footer);
    updateHeroState();
    window.addEventListener("scroll", updateHeroState, { passive: true });
    window.addEventListener("resize", updateHeroState);

    return () => {
      chapterObserver.disconnect();
      footerObserver.disconnect();
      window.removeEventListener("scroll", updateHeroState);
      window.removeEventListener("resize", updateHeroState);
    };
  }, [chapters]);

  const jumpTo = (event, id) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav
      className={`${styles.index} ${isPastHero && !isFooterVisible ? styles.visible : ""}`}
      aria-label="Beyond page chapters"
    >
      <span className={styles.rule} aria-hidden="true" />
      {chapters.map((chapter, index) => (
        <a
          key={chapter.id}
          className={activeId === chapter.id ? styles.active : ""}
          href={`#${chapter.id}`}
          aria-label={`Chapter ${index + 1}: ${chapter.label}`}
          aria-current={activeId === chapter.id ? "location" : undefined}
          onClick={(event) => jumpTo(event, chapter.id)}
        >
          {String(index + 1).padStart(2, "0")}
        </a>
      ))}
    </nav>
  );
}
