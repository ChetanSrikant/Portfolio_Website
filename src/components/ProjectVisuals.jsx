import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./ProjectVisuals.module.css";

gsap.registerPlugin(ScrollTrigger);

function useProjectVisualMotion() {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (reducedMotion) {
      root.dataset.entered = "true";
      root.dataset.inView = "true";
      return undefined;
    }

    let visibilityTrigger;
    const context = gsap.context(() => {
      const reveals = gsap.utils.toArray("[data-visual-reveal]");
      const lines = gsap.utils.toArray("[data-visual-line]");
      const routes = gsap.utils.toArray("[data-visual-route]");

      if (reveals.length) gsap.set(reveals, { autoAlpha: 0, y: 16 });
      if (lines.length) {
        gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });
      }
      if (routes.length) {
        gsap.set(routes, { strokeDasharray: 1, strokeDashoffset: 1 });
      }

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: () => {
          root.dataset.entered = "true";
        },
      });

      if (reveals.length) {
        timeline.to(reveals, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
        });
      }
      if (lines.length) {
        timeline.to(lines, { scaleX: 1, duration: 0.65, stagger: 0.08 }, 0.12);
      }
      if (routes.length) {
        timeline.to(routes, { strokeDashoffset: 0, duration: 1.1, stagger: 0.11 }, 0.1);
      }

      ScrollTrigger.create({
        trigger: root,
        start: "clamp(top 78%)",
        once: true,
        onEnter: () => timeline.play(),
      });

      visibilityTrigger = ScrollTrigger.create({
        trigger: root,
        start: "clamp(top bottom)",
        end: "clamp(bottom top)",
        onToggle: ({ isActive }) => {
          root.dataset.inView = String(isActive);
        },
      });
    }, root);

    return () => {
      visibilityTrigger?.kill();
      context.revert();
      delete root.dataset.entered;
      delete root.dataset.inView;
    };
  }, [reducedMotion]);

  return rootRef;
}

function VisualFrame({ variant, title, marker, children, flow }) {
  const rootRef = useProjectVisualMotion();

  return (
    <figure
      ref={rootRef}
      className={`${styles.visual} ${styles[variant]}`}
      aria-label={`${title}. ${flow.join(" then ")}.`}
    >
      <header className={styles.frameHeader} data-visual-reveal>
        <span>{title}</span>
        <strong>{marker}</strong>
      </header>
      <div className={styles.scene} aria-hidden="true">
        {children}
      </div>
      <figcaption>
        {flow.map((step, index) => (
          <React.Fragment key={step}>
            <span
              className={styles.flowNode}
              data-visual-reveal
              style={{ "--flow-step": index }}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{step}</strong>
            </span>
            {index < flow.length - 1 ? <i data-visual-line /> : null}
          </React.Fragment>
        ))}
      </figcaption>
    </figure>
  );
}

function TransitVisual() {
  return (
    <VisualFrame
      variant="transit"
      title="Public transport demand platform"
      marker="Team challenge winner"
      flow={["Transport data", "Forecast", "Web application", "Interpretation"]}
    >
      <div className={styles.transitMap} data-visual-reveal>
        <span className={styles.sceneLabel}>Demand network</span>
        <svg viewBox="0 0 620 320" preserveAspectRatio="xMidYMid meet">
          <path className={styles.mapContour} d="M42 246 C118 207 106 102 194 84 C287 65 313 139 390 120 C466 101 486 46 578 60" />
          <path data-visual-route className={`${styles.route} ${styles.routeCyan}`} pathLength="1" d="M53 255 C118 201 117 122 205 102 C292 82 330 175 405 146 C476 119 505 78 568 73" />
          <path data-visual-route className={`${styles.route} ${styles.routeAmber}`} pathLength="1" d="M88 72 C159 101 172 198 261 213 C351 228 402 168 468 201 C519 227 542 266 591 252" />
          <path data-visual-route className={`${styles.route} ${styles.routeBlue}`} pathLength="1" d="M71 174 C149 169 197 139 256 151 C330 166 373 260 458 249 C511 242 543 191 590 171" />
          {["53,255", "116,202", "205,102", "329,167", "405,146", "568,73", "88,72", "261,213", "468,201", "591,252", "71,174", "458,249"].map((point) => {
            const [cx, cy] = point.split(",");
            return <circle key={point} className={styles.station} cx={cx} cy={cy} r="5" />;
          })}
          <circle className={`${styles.signal} ${styles.signalOne}`} cx="205" cy="102" r="8" />
          <circle className={`${styles.signal} ${styles.signalTwo}`} cx="468" cy="201" r="8" />
        </svg>
      </div>

      <div className={styles.forecastPanel} data-visual-reveal>
        <div className={styles.panelTitle}>
          <span>Demand signal</span>
          <small>Observed / forecast</small>
        </div>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none">
          <path className={styles.forecastBand} d="M0 112 C42 105 56 70 92 82 C125 93 149 57 181 65 C218 74 241 28 300 40 L300 86 C252 77 226 116 184 103 C146 91 121 119 84 111 C47 104 25 132 0 128 Z" />
          <path data-visual-route className={styles.forecastLine} pathLength="1" d="M0 120 C42 112 57 78 92 91 C126 102 148 66 181 75 C218 84 242 40 300 51" />
          <line className={styles.forecastDivider} x1="181" x2="181" y1="20" y2="135" />
        </svg>
        <div className={styles.forecastLegend}><span>Historical pattern</span><span>Forecast window</span></div>
      </div>
    </VisualFrame>
  );
}

function RagVisual() {
  return (
    <VisualFrame
      variant="rag"
      title="Conversational RAG"
      marker="Grounded retrieval"
      flow={["Question", "Retrieve", "Context", "Answer"]}
    >
      <div className={styles.ragProduct} data-visual-reveal>
        <img
          src="/images/work/conversational-rag-phone.png"
          alt=""
          loading="lazy"
        />
        <div className={styles.ragHalo} />
      </div>

      <div className={styles.ragProcess}>
        <div className={styles.queryBlock} data-visual-reveal>
          <small>Question</small>
          <strong>What does the source say?</strong>
        </div>
        <span className={styles.processLine} data-visual-line />
        <div className={styles.chunkStack} data-visual-reveal>
          <span>Source A</span>
          <span>Source B</span>
          <span>Source C</span>
        </div>
        <span className={styles.processLine} data-visual-line />
        <div className={styles.answerBlock} data-visual-reveal>
          <small>Grounded response</small>
          <span>Selected context supports the answer.</span>
        </div>
      </div>
    </VisualFrame>
  );
}

function VisionVisual() {
  return (
    <VisualFrame
      variant="vision"
      title="Computer vision image search"
      marker="Detection to retrieval"
      flow={["Image", "Detect", "Index", "Results"]}
    >
      <div className={styles.visionSource} data-visual-reveal>
        <span className={styles.sceneLabel}>Source image</span>
        <img src="/images/work/computer-vision/vision-times-square.webp" alt="" loading="lazy" />
        <span className={`${styles.detectionBox} ${styles.personBox}`}><i>Person</i></span>
        <span className={`${styles.detectionBox} ${styles.carBox}`}><i>Car</i></span>
        <span className={styles.scanLine} />
      </div>

      <div className={styles.visionIndex} data-visual-reveal>
        <span>Detected content</span>
        <strong>PERSON</strong>
        <strong>CAR</strong>
        <small>Searchable object index</small>
      </div>

      <div className={styles.visionResults} data-visual-reveal>
        <span className={styles.sceneLabel}>Matched images</span>
        <figure><img src="/images/work/computer-vision/vision-detections.webp" alt="" loading="lazy" /></figure>
        <figure><img src="/images/work/computer-vision/vision-object-collection.webp" alt="" loading="lazy" /></figure>
        <figure><img src="/images/work/computer-vision/vision-times-square.webp" alt="" loading="lazy" /></figure>
      </div>
    </VisualFrame>
  );
}

export default function ProjectVisual({ project }) {
  if (project === "tgsrtc") return <TransitVisual />;
  if (project === "rag") return <RagVisual />;
  return <VisionVisual />;
}
