import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BackgroundBeams from "./BackgroundBeams.jsx";
import styles from "./HomeCompletionSections.module.css";

gsap.registerPlugin(ScrollTrigger);

const PROOF_ITEMS = [
  {
    number: "01",
    title: "AI applications",
    detail: "GenAI · Retrieval · Computer vision · Forecasting",
  },
  {
    number: "02",
    title: "Software development",
    detail: "APIs · Full-stack applications · Product interfaces",
  },
  {
    number: "03",
    title: "Building end to end",
    detail: "Models · Logic · Systems · Product experience",
  },
];

const PROJECTS = [
  {
    code: "SYS / 01",
    category: "Public-sector AI / AI4TG",
    title: "TGSRTC Public Transport Demand Platform",
    summary:
      "An applied AI platform for public-transport demand planning, combining forecasting, interactive analysis, and a domain-focused assistant.",
    stack: ["Forecasting", "Interactive analysis", "AI assistant"],
    steps: ["Ridership + routes", "Forecast", "Explore", "Plan"],
    evidence: [
      "Forecasting workflow for demand analysis",
      "Interactive planning and analysis layer",
      "Domain-focused assistant for guided exploration",
    ],
  },
  {
    code: "SYS / 02",
    category: "GenAI / Retrieval systems",
    title: "Conversational RAG Application",
    summary:
      "A multi-turn retrieval application with persistent conversation state, Hugging Face embeddings, Groq inference, and a Streamlit interface.",
    stack: ["LangGraph", "Hugging Face", "Groq", "Streamlit"],
    steps: ["Source docs", "Embeddings", "Retrieve", "State", "Answer"],
    evidence: [
      "LangGraph conversation-state management",
      "Hugging Face embeddings for retrieval",
      "Groq inference over retrieved document chunks",
    ],
  },
  {
    code: "SYS / 03",
    category: "Computer vision / Search",
    title: "Computer Vision Image Search",
    summary:
      "A visual-search workflow that detects objects with YOLOv11, indexes image content, and retrieves relevant images through a simple interface.",
    stack: ["YOLOv11", "Python", "Streamlit"],
    steps: ["Image", "Detect", "Index", "Query", "Results"],
    evidence: [
      "YOLOv11 object-detection stage",
      "Searchable visual-content index",
      "Query and retrieval interface",
    ],
  },
];

const FOCUS_ITEMS = [
  {
    number: "01",
    title: "AI applications",
    detail: "Building more production-minded AI experiences.",
  },
  {
    number: "02",
    title: "Software development",
    detail: "Improving architecture and end-to-end implementation.",
  },
  {
    number: "03",
    title: "DSA",
    detail: "Strengthening fundamentals and problem solving.",
  },
  {
    number: "04",
    title: "Experimentation",
    detail: "Trying new tools, interfaces, agents, and creative ideas.",
  },
];

function ProofStrip() {
  return (
    <section
      id="skills-proof"
      className={styles.proof}
      data-gundam-stage-anchor="skills"
      aria-labelledby="proof-heading"
    >
      <div className={styles.inner}>
        <h2 id="proof-heading" className={styles.srOnly}>
          Areas of practice
        </h2>
        <ol className={styles.proofGrid}>
          {PROOF_ITEMS.map((item) => (
            <li key={item.number} className={styles.proofItem}>
              <span className={styles.itemNumber}>{item.number}</span>
              <div>
                <h3 className={styles.proofTitle}>{item.title}</h3>
                <p className={styles.proofDetail}>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PhilosophySection() {
  return (
    <section
      id="philosophy"
      className={styles.philosophy}
      data-gundam-stage-anchor="philosophy"
      aria-labelledby="philosophy-heading"
    >
      <div className={`${styles.inner} ${styles.philosophyGrid}`}>
        <div className={styles.philosophyCopy}>
          <span className={`eyebrow ${styles.philosophyLabel}`}>
            // philosophy.md
          </span>
          <h2 id="philosophy-heading" className={styles.srOnly}>
            Philosophy
          </h2>
          <p className={styles.philosophyStatement}>
            Build systems that move with intent, adapt under pressure, and stay
            understandable when complexity rises. AI supplies leverage.
            Judgment gives it direction.
          </p>
        </div>
        <div className={styles.philosophyModelSpace} aria-hidden="true" />
      </div>
    </section>
  );
}

function WorkflowVisual({ project }) {
  return (
    <figure className={styles.workflow}>
      <div className={styles.workflowHeader}>
        <span>{project.code}</span>
        <span>Confirmed workflow</span>
      </div>
      <div
        className={styles.workflowSteps}
        role="img"
        aria-label={`${project.title} workflow: ${project.steps.join(" to ")}`}
      >
        {project.steps.map((step, index) => (
          <React.Fragment key={step}>
            <span className={styles.workflowNode}>{step}</span>
            {index < project.steps.length - 1 && (
              <span className={styles.workflowConnector} aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
      <figcaption>
        Code-native system view. No performance metrics are implied.
      </figcaption>
    </figure>
  );
}

function SelectedWork() {
  return (
    <section
      id="selected-work"
      className={styles.selectedWork}
      data-gundam-stage-anchor="projects"
      aria-labelledby="selected-work-heading"
    >
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <div>
            <span className="eyebrow">Selected work / 03</span>
            <h2 id="selected-work-heading" className={styles.sectionTitle}>
              Three systems worth opening first.
            </h2>
          </div>
          <p>
            Curated technical work, presented without invented metrics or
            placeholder outcomes.
          </p>
        </header>

        <div className={styles.projectList}>
          {PROJECTS.map((project) => (
            <article key={project.code} className={styles.project}>
              <div className={styles.projectVisual}>
                <WorkflowVisual project={project} />
              </div>
              <div className={styles.projectBody}>
                <span className={styles.projectCategory}>{project.category}</span>
                <h3>{project.title}</h3>
                <p className={styles.projectSummary}>{project.summary}</p>
                <ul className={styles.techList} aria-label="Technology and scope">
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <details className={styles.projectDetails}>
                  <summary>View project evidence <span aria-hidden="true">→</span></summary>
                  <ul>
                    {project.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function VelocityDivider() {
  const sectionRef = useRef(null);
  const rowOneRef = useRef(null);
  const rowTwoRef = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          rowOneRef.current,
          { xPercent: -8 },
          {
            xPercent: -28,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "clamp(top bottom)",
              end: "clamp(bottom top)",
              scrub: 0.45,
            },
          }
        );

        gsap.fromTo(
          rowTwoRef.current,
          { xPercent: -30 },
          {
            xPercent: -9,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "clamp(top bottom)",
              end: "clamp(bottom top)",
              scrub: 0.55,
            },
          }
        );
      });

      return () => media.revert();
    }, sectionRef);

    return () => context.revert();
  }, []);

  const rowOne = "AI · SOFTWARE · DEVELOPMENT · GENERATIVE AI · COMPUTER VISION · ";
  const rowTwo = "BUILD · EXPERIMENT · SHIP · LEARN · CREATE · ";

  return (
    <section
      id="experience-transition"
      ref={sectionRef}
      className={styles.velocity}
      data-gundam-stage-anchor="experience"
      aria-label="AI and development practice"
    >
      <p className={styles.srOnly}>{rowOne} {rowTwo}</p>
      <div className={styles.velocityViewport} aria-hidden="true">
        <div ref={rowOneRef} className={`${styles.velocityRow} ${styles.velocityPrimary}`}>
          {rowOne.repeat(3)}
        </div>
        <div ref={rowTwoRef} className={`${styles.velocityRow} ${styles.velocitySecondary}`}>
          {rowTwo.repeat(4)}
        </div>
      </div>
    </section>
  );
}

function CurrentFocus() {
  return (
    <section
      id="current-focus"
      className={styles.currentFocus}
      data-gundam-stage-anchor="experience"
      aria-labelledby="focus-heading"
    >
      <div className={styles.inner}>
        <header className={styles.focusHeader}>
          <span className="eyebrow">Current direction</span>
          <h2 id="focus-heading" className={styles.sectionTitle}>
            What I’m focused on now.
          </h2>
        </header>

        <ol className={styles.focusGrid}>
          {FOCUS_ITEMS.map((item) => (
            <li key={item.number}>
              <span className={styles.itemNumber}>{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <aside className={styles.editorialCta} aria-label="Start a conversation">
          <p>Have a difficult problem with an unclear path?</p>
          <a href="mailto:chetansrikantmandiga@gmail.com">
            Let’s map it <span aria-hidden="true">↗</span>
          </a>
        </aside>
      </div>
    </section>
  );
}

export default function HomeCompletionSections() {
  return (
    <div className={styles.completion}>
      <ProofStrip />
      <BackgroundBeams
        id="creative-interlude"
        stageAnchor="creative"
        eyebrow="Between disciplines"
        title="I build where AI, software, and imagination meet."
      />
      <PhilosophySection />
      <SelectedWork />
      <VelocityDivider />
      <CurrentFocus />
    </div>
  );
}
