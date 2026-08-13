import React, { useMemo, useState } from "react";
import InternalPageShell, { EditorialCTA, PageHero, SectionHeader } from "../components/InternalPageShell.jsx";
import styles from "./InternalPages.module.css";

const PROJECTS = [
  { slug: "zap-ride-hailing", title: "ZAP Ride-Hailing", year: "Build", category: "Full-stack", summary: "A product-oriented ride-hailing application exploring booking flows and service interactions.", role: "Full-stack product implementation", technologies: ["Application UI", "Backend flow", "Product logic"], repository: null, demo: null, featured: true, lessons: "Complex products become manageable when user states and system states are designed together.", visual: "linear-gradient(145deg,#3a190f,#b35422 46%,#17100d)" },
  { slug: "loop-chat", title: "LOOP Chat", year: "Build", category: "Full-stack", summary: "A communication product exploring messaging behavior, interface state, and backend coordination.", role: "Full-stack application implementation", technologies: ["Messaging UI", "Application state", "Backend"], repository: null, demo: null, featured: true, lessons: "Realtime-feeling interfaces depend on explicit state and clear feedback, even before scale enters the problem.", visual: "linear-gradient(145deg,#0c2631,#176b75 48%,#101519)" },
  { slug: "driver-drowsiness", title: "Driver Drowsiness", year: "Experiment", category: "Computer Vision", summary: "A safety-focused computer-vision experiment for detecting visual signs associated with drowsiness.", role: "Computer vision experimentation", technologies: ["Computer vision", "Detection", "Alert flow"], repository: null, demo: null, featured: false, lessons: "A prototype can explore signal and alert logic, but it must not be mistaken for an automotive or medical safety system.", visual: "linear-gradient(145deg,#101b2a,#355c88 45%,#0d1117)" },
  { slug: "creditworthy-borrower", title: "Creditworthy Borrower", year: "Experiment", category: "Machine Learning", summary: "A structured-data workflow exploring borrower classification without presenting unverified evaluation claims.", role: "Machine-learning workflow", technologies: ["Data preparation", "Classification", "Evaluation workflow"], repository: null, demo: null, featured: false, lessons: "Financial classification requires careful attention to data quality, fairness, and evaluation context.", visual: "linear-gradient(145deg,#172116,#66764b 50%,#11130f)" },
  { slug: "sentiment-classifier", title: "Sentiment Classifier", year: "Experiment", category: "AI / GenAI", summary: "An NLP experiment mapping text input to sentiment classes and exposing the prediction through a simple interface.", role: "NLP and interface experimentation", technologies: ["NLP", "Classification", "Python"], repository: null, demo: null, featured: false, lessons: "Simple labels hide ambiguity, so examples and failure cases matter as much as the prediction itself.", visual: "linear-gradient(145deg,#271733,#7c3f88 46%,#160f1b)" },
  { slug: "voice-order-agent", title: "Voice-to-Order Agent", year: "Experiment", category: "AI / GenAI", summary: "An applied-AI interface experiment turning spoken input into a structured order intent.", role: "Applied-AI interaction design", technologies: ["Voice input", "Intent extraction", "Structured output"], repository: null, demo: null, featured: true, lessons: "The useful boundary is not transcription alone; it is reliable conversion into an inspectable action structure.", visual: "linear-gradient(145deg,#2a2110,#a47e28 45%,#17130c)" },
];

const FILTERS = ["All", ...new Set(PROJECTS.map((project) => project.category))];

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [activeSlug, setActiveSlug] = useState(PROJECTS[0].slug);
  const filtered = useMemo(() => filter === "All" ? PROJECTS : PROJECTS.filter((project) => project.category === filter), [filter]);

  const chooseFilter = (next) => {
    setFilter(next);
    const first = next === "All" ? PROJECTS[0] : PROJECTS.find((project) => project.category === next);
    setActiveSlug(first?.slug || "");
  };

  return (
    <InternalPageShell title="Projects">
      <PageHero eyebrow="Projects / Experiments" title="Products, prototypes, and things I built to learn." intro="A faster view of software projects and AI experiments across different problem types. Work contains the deeper case studies." meta={`${PROJECTS.length} verified project entries`} />

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Filter and discover" title="Breadth without the noise." copy="Categories come directly from the project dataset. Select a filter, then hover, focus, or tap a project to expand it." />
          <div className={styles.filterBar} role="toolbar" aria-label="Filter projects">
            {FILTERS.map((item) => <button key={item} type="button" className={`${styles.filterButton} ${filter === item ? styles.filterButtonActive : ""}`} aria-pressed={filter === item} onClick={() => chooseFilter(item)}>{item}</button>)}
          </div>

          <div className={styles.projectGallery} aria-live="polite">
            {filtered.map((project, index) => {
              const active = activeSlug === project.slug;
              return (
                <article
                  key={project.slug}
                  className={`${styles.projectCard} ${active ? styles.projectCardActive : ""}`}
                  tabIndex="0"
                  onMouseEnter={() => setActiveSlug(project.slug)}
                  onFocus={() => setActiveSlug(project.slug)}
                  onClick={() => setActiveSlug(project.slug)}
                  aria-label={`${project.title}. ${project.category}. ${project.summary}`}
                >
                  <div className={styles.projectVisual} style={{ "--visual": project.visual }} aria-hidden="true" />
                  <div className={styles.projectContent}>
                    <span className={styles.projectIndex}>{String(index + 1).padStart(2, "0")} / {project.category}</span>
                    <h2>{project.title}</h2>
                    <div className={styles.projectDetails}>
                      <p>{project.summary}</p>
                      <div className={styles.techRow}>{project.technologies.map((technology) => <span key={technology}>/{technology}</span>)}</div>
                      <p><strong>Role:</strong> {project.role}<br /><strong>Lesson:</strong> {project.lessons}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={`${styles.sectionInner} ${styles.splitGrid}`}>
          <div><span className={styles.eyebrow}>Data model</span><h2>One structure, six distinct builds.</h2></div>
          <div className={styles.prose}><p>Every entry carries a slug, title, category, summary, role, technologies, link state, featured state, and lesson. Repository and demo links remain absent until verified URLs are supplied.</p><p><strong>No scale, adoption, certification, or accuracy metrics are claimed.</strong> The presentation focuses on the problem and the learning each build supports.</p></div>
        </div>
      </section>

      <EditorialCTA eyebrow="Deep evidence" title="Need the architecture, decisions, and constraints?" copy="The Work page examines three flagship systems in more depth." actions={[{ label: "Read selected work", href: "/work" }, { label: "About my approach", href: "/about" }]} />
    </InternalPageShell>
  );
}
