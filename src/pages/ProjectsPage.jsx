import React, { useEffect, useMemo, useRef, useState } from "react";
import InternalPageShell, { EditorialCTA, PageHero, SectionHeader } from "../components/InternalPageShell.jsx";
import GridBloom from "../components/ui/GridBloom.jsx";
import SystemIllustration from "../components/SystemIllustration.jsx";
import styles from "./InternalPages.module.css";

const PROJECTS = [
  { slug: "zap-ride-hailing", title: "ZAP Ride-Hailing", year: "Build", category: "Full-stack", summary: "A product-oriented ride-hailing application exploring booking flows and service interactions.", role: "Full-stack product implementation", technologies: ["Application UI", "Backend flow", "Product logic"], repository: null, demo: null, featured: true, lessons: "Complex products become manageable when user states and system states are designed together.", visual: "linear-gradient(145deg,#3a190f,#b35422 46%,#17100d)", image: "/images/projects/zap-ride-hailing.webp", imagePosition: "center center" },
  { slug: "loop-chat", title: "LOOP Chat", year: "Build", category: "Full-stack", summary: "A communication product exploring messaging behavior, interface state, and backend coordination.", role: "Full-stack application implementation", technologies: ["Messaging UI", "Application state", "Backend"], repository: null, demo: null, featured: true, lessons: "Realtime-feeling interfaces depend on explicit state and clear feedback, even before scale enters the problem.", visual: "linear-gradient(145deg,#0c2631,#176b75 48%,#101519)", image: "/images/projects/loop-chat.webp", imagePosition: "center center" },
  { slug: "driver-drowsiness", title: "Driver Drowsiness", year: "Experiment", category: "Computer Vision", summary: "A safety-focused computer-vision experiment for detecting visual signs associated with drowsiness.", role: "Computer vision experimentation", technologies: ["Computer vision", "Detection", "Alert flow"], repository: null, demo: null, featured: false, lessons: "A prototype can explore signal and alert logic, but it must not be mistaken for an automotive or medical safety system.", visual: "linear-gradient(145deg,#101b2a,#355c88 45%,#0d1117)", image: "/images/projects/driver-drowsiness.webp", imagePosition: "center center" },
  { slug: "creditworthy-borrower", title: "Creditworthy Borrower", year: "Experiment", category: "Machine Learning", summary: "A structured-data workflow exploring borrower classification without presenting unverified evaluation claims.", role: "Machine-learning workflow", technologies: ["Data preparation", "Classification", "Evaluation workflow"], repository: null, demo: null, featured: false, lessons: "Financial classification requires careful attention to data quality, fairness, and evaluation context.", visual: "linear-gradient(145deg,#172116,#66764b 50%,#11130f)", image: "/images/projects/creditworthy-borrower.webp", imagePosition: "center center" },
  { slug: "sentiment-classifier", title: "Sentiment Classifier", year: "Experiment", category: "AI / GenAI", summary: "An NLP experiment mapping text input to sentiment classes and exposing the prediction through a simple interface.", role: "NLP and interface experimentation", technologies: ["NLP", "Classification", "Python"], repository: null, demo: null, featured: false, lessons: "Simple labels hide ambiguity, so examples and failure cases matter as much as the prediction itself.", visual: "linear-gradient(145deg,#271733,#7c3f88 46%,#160f1b)", image: "/images/projects/sentiment-classifier.webp", imagePosition: "center center" },
  { slug: "voice-order-agent", title: "Voice-to-Order Agent", year: "Experiment", category: "AI / GenAI", summary: "An applied-AI interface experiment turning spoken input into a structured order intent.", role: "Applied-AI interaction design", technologies: ["Voice input", "Intent extraction", "Structured output"], repository: null, demo: null, featured: true, lessons: "The useful boundary is not transcription alone; it is reliable conversion into an inspectable action structure.", visual: "linear-gradient(145deg,#071423,#2458a5 46%,#120d23)", image: "/images/projects/voice-order-agent-v3.jpg", imagePosition: "center center" },
];

const CASE_STUDIES = {
  "zap-ride-hailing": {
    problem: "Make a multi-stage ride request feel predictable as a rider moves from account setup to trip selection.",
    focus: "Account creation, location entry, vehicle comparison, and the handoff between interface state and booking logic.",
    workflow: ["Account setup", "Trip input", "Vehicle choice", "Booking state"],
    contribution: "Designed and implemented the product flow across the application interface and its backend-facing states.",
  },
  "loop-chat": {
    problem: "Keep conversation state understandable while users move between threads, compose messages, and coordinate shared activity.",
    focus: "Workspace navigation, active-thread state, message composition, file actions, and explicit feedback for asynchronous behavior.",
    workflow: ["Workspace state", "Conversation selection", "Message composition", "Backend coordination"],
    contribution: "Implemented the full-stack application flow with particular attention to messaging state and interaction feedback.",
  },
  "driver-drowsiness": {
    problem: "Explore how visible eye and attention signals could support a driver-drowsiness alert experiment.",
    focus: "Camera input, face and eye-region detection, signal interpretation, alert state, and prototype limitations.",
    workflow: ["Camera frame", "Face and eye region", "Signal interpretation", "Alert state"],
    contribution: "Built the computer-vision experiment and the accompanying detection-to-alert flow.",
  },
  "creditworthy-borrower": {
    problem: "Explore borrower classification as a structured machine-learning workflow without presenting the output as an unquestionable decision.",
    focus: "Data preparation, feature inspection, classification, evaluation structure, fairness, and interpretability.",
    workflow: ["Prepare data", "Inspect features", "Classify", "Review evaluation"],
    contribution: "Developed the machine-learning workflow and organized the analysis around inspectable stages.",
  },
  "sentiment-classifier": {
    problem: "Turn text into a sentiment label while keeping the processing sequence and the ambiguity of each label visible.",
    focus: "Text preparation, tokenization, representation, classification, interface feedback, and failure-case awareness.",
    workflow: ["Input text", "Tokenize", "Represent", "Classify sentiment"],
    contribution: "Built the NLP experiment and the interface used to submit text and inspect its predicted class.",
  },
  "voice-order-agent": {
    problem: "Convert an open-ended spoken request into a structured order that remains reviewable before any action is confirmed.",
    focus: "Voice capture, transcription, item and modifier extraction, order assembly, and explicit user confirmation.",
    workflow: ["Capture voice", "Extract intent", "Build order", "Review and confirm"],
    contribution: "Designed the applied-AI interaction flow from spoken input to an inspectable structured order.",
  },
};

const FILTERS = ["All", ...new Set(PROJECTS.map((project) => project.category))];

export default function ProjectsPage() {
  const [filter, setFilter] = useState("All");
  const [activeSlug, setActiveSlug] = useState(PROJECTS[0].slug);
  const [detailSlug, setDetailSlug] = useState(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const filtered = useMemo(() => filter === "All" ? PROJECTS : PROJECTS.filter((project) => project.category === filter), [filter]);
  const detailProject = detailSlug ? PROJECTS.find((project) => project.slug === detailSlug) : null;

  useEffect(() => {
    if (!detailProject) return undefined;

    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDetailSlug(null);
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [detailProject]);

  const openCaseStudy = (project, trigger) => {
    triggerRef.current = trigger;
    setActiveSlug(project.slug);
    setDetailSlug(project.slug);
  };

  const chooseFilter = (next) => {
    setFilter(next);
    const first = next === "All" ? PROJECTS[0] : PROJECTS.find((project) => project.category === next);
    setActiveSlug(first?.slug || "");
  };

  return (
    <InternalPageShell title="Projects">
      <div className={styles.shaderHero}>
        <GridBloom
          className={styles.projectGridBloom}
          color="#e0bb63"
          speed={0.46}
          gridScale={10.5}
          rotationSpeed={0.018}
          fadeFalloff={1.1}
          distortionAmount={0.032}
          flowSpeedX={-0.1}
          flowSpeedY={-0.18}
          hoverLightRadius={0.46}
          hoverRepulsionRadius={0.72}
          hoverRepulsionStrength={0.24}
        />
        <div className={styles.shaderHeroVeil} aria-hidden="true" />
        <PageHero eyebrow="Projects / Experiments" title="Products, prototypes, and things I built to learn." intro="A faster view of software projects and AI experiments across different problem types. Work contains the deeper case studies." meta={`${PROJECTS.length} verified project entries`} />
        <span className={styles.shaderFieldLabel} aria-hidden="true">GRID FIELD / POINTER REACTIVE</span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Filter and discover" title="Breadth without the noise." copy="Select a filter, hover or focus to preview a project, then choose it to open the complete case study." />
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
                  role="button"
                  aria-haspopup="dialog"
                  onMouseEnter={() => setActiveSlug(project.slug)}
                  onFocus={() => setActiveSlug(project.slug)}
                  onClick={(event) => openCaseStudy(project, event.currentTarget)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    openCaseStudy(project, event.currentTarget);
                  }}
                  aria-label={`${project.title}. ${project.category}. ${project.summary}`}
                >
                  <div className={styles.projectVisual} style={{ "--visual": project.visual, "--image-position": project.imagePosition || "center" }} aria-hidden="true">
                    {project.image ? <img src={project.image} alt="" loading="lazy" decoding="async" /> : null}
                  </div>
                  <div className={styles.projectContent}>
                    <span className={styles.projectIndex}>{String(index + 1).padStart(2, "0")} / {project.category}</span>
                    <h2>{project.title}</h2>
                    <div className={styles.projectDetails}>
                      <p>{project.summary}</p>
                      <div className={styles.techRow}>{project.technologies.map((technology) => <span key={technology}>/{technology}</span>)}</div>
                      <p><strong>Role:</strong> {project.role}<br /><strong>Lesson:</strong> {project.lessons}</p>
                      <span className={styles.projectOpenHint}>Open case study</span>
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

      {detailProject ? (
        <div
          className={styles.projectModal}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailSlug(null);
          }}
        >
          <section
            className={styles.projectModalPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-case-study-title"
          >
            <button ref={closeButtonRef} type="button" className={styles.projectModalClose} onClick={() => setDetailSlug(null)}>
              Close
            </button>

            <header className={styles.projectModalHeader}>
              <span>{detailProject.category} / {detailProject.year}</span>
              <h2 id="project-case-study-title">{detailProject.title}</h2>
              <p>{detailProject.summary}</p>
            </header>

            <figure className={styles.projectModalMedia}>
              <img src={detailProject.image} alt={`${detailProject.title} project visual`} />
            </figure>

            <div className={styles.projectModalBody}>
              <section>
                <h3>The problem</h3>
                <p>{CASE_STUDIES[detailProject.slug].problem}</p>
              </section>
              <section>
                <h3>Build focus</h3>
                <p>{CASE_STUDIES[detailProject.slug].focus}</p>
              </section>
              <section className={styles.projectModalWorkflow}>
                <SystemIllustration
                  label="SYSTEM / PROJECT FLOW"
                  steps={CASE_STUDIES[detailProject.slug].workflow}
                  status="Architecture record"
                  compact
                />
              </section>
              <section>
                <h3>My contribution</h3>
                <p>{CASE_STUDIES[detailProject.slug].contribution}</p>
              </section>
              <section>
                <h3>What I learned</h3>
                <p>{detailProject.lessons}</p>
              </section>
              <section>
                <h3>Evidence boundary</h3>
                <p>This case study does not claim verified scale, adoption, certification, accuracy, or production impact.</p>
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </InternalPageShell>
  );
}
