import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InternalPageShell from "../components/InternalPageShell.jsx";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import {
  ArtifactRail,
  ContextChips,
  LessonFold,
  StoryWorkspace,
} from "../components/about/AboutStoryComponents.jsx";
import styles from "./AboutPage.module.css";

gsap.registerPlugin(ScrollTrigger);

const ARTIFACTS = [
  {
    title: "Campus frame",
    context: "BML Munjal University",
    src: "/images/drift-wall/drift-11.jpeg",
    alt: "Chetan standing on the BML Munjal University campus",
    description: "A place where computer science, entrepreneurship, and years of experimentation began to connect.",
    position: "50% 35%",
  },
  {
    title: "Working set",
    context: "Technology in motion",
    src: "/media/tech-stack-showcase.mp4",
    alt: "Animated overview of technologies explored across software and AI work",
    description: "The tools changed with the problem. The habit of learning across layers stayed consistent.",
    type: "video",
  },
  {
    title: "Everyday references",
    context: "Personal archive",
    src: "/images/drift-wall/drift-07.jpeg",
    alt: "A personal photograph from Chetan's visual archive",
    description: "Ordinary spaces became a source of visual references beyond code and coursework.",
    position: "50% 28%",
  },
  {
    title: "Outside the screen",
    context: "Personal archive",
    src: "/images/drift-wall/drift-06.jpeg",
    alt: "A night photograph from Chetan's personal archive",
    description: "Curiosity kept moving through places, images, and experiences that had nothing to do with a framework.",
    position: "50% 38%",
  },
  {
    title: "Perspective",
    context: "Personal archive",
    src: "/images/drift-wall/drift-12.jpeg",
    alt: "Black-and-white portrait of Chetan seated in front of a horse",
    description: "The references that shape the work are not always technical.",
    position: "50% 40%",
  },
];

const CURIOSITIES = [
  ["AI applications", "I am interested in the point where model capability becomes a useful product experience."],
  ["Backend systems", "Reliable boundaries, data flow, and failure handling are what let an interface keep its promises."],
  ["Agents", "Agents are interesting when they can act with context while keeping their decisions understandable."],
  ["Computer vision", "Vision turns images and video into a new surface for software to reason about."],
  ["Generative AI", "Generative systems open new ways to create, explore, and communicate ideas."],
  ["Automation", "Repeated effort often reveals a process that software can make calmer and more dependable."],
  ["DSA / problem solving", "Fundamentals sharpen the way I reason about constraints, tradeoffs, and edge cases."],
  ["Interaction design", "A system only becomes useful when someone can understand what it is doing and what to do next."],
];

function ExplorationArtifact({ className, title, children }) {
  return (
    <article className={`${styles.explorationArtifact} ${className}`} data-panel>
      <span>{title}</span>
      <p>{children}</p>
    </article>
  );
}

export default function AboutPage() {
  const pageRef = useRef(null);
  const [activeCuriosity, setActiveCuriosity] = useState(0);
  const reducedMotion = useReducedMotionPreference();

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root || reducedMotion) return undefined;
    let removeLoadListener = () => {};

    const context = gsap.context(() => {
      const opening = gsap.timeline({ defaults: { ease: "power3.out" } });
      opening
        .from("[data-opening-line]", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.1 })
        .from("[data-opening-copy]", { y: 20, opacity: 0, duration: 0.7 }, "-=0.45")
        .to(`.${styles.portraitCurtain}`, { yPercent: -102, duration: 1.15, ease: "power4.inOut" }, "-=0.75")
        .from(`.${styles.heroPortrait} img`, { scale: 1.055, duration: 1.45 }, "-=1.15");

      gsap.utils.toArray("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 32,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 84%", once: true },
        });
      });

      gsap.utils.toArray("[data-panel]").forEach((element, index) => {
        gsap.from(element, {
          y: 24 + (index % 3) * 8,
          autoAlpha: 0,
          duration: 0.75,
          delay: (index % 3) * 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      const journey = gsap.timeline({
        scrollTrigger: { trigger: `.${styles.realWorld}`, start: "top 64%", once: true },
      });
      journey
        .from(`.${styles.journeyFill}`, {
          scaleX: 0,
          scaleY: 0,
          duration: 1.3,
          ease: "power3.inOut",
        })
        .from(`.${styles.journeyStep}`, { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.8")
        .from(`.${styles.experienceMarker}`, { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.12 }, "-=0.35");

      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready?.then(refresh);
      window.addEventListener("load", refresh, { once: true });
      removeLoadListener = () => window.removeEventListener("load", refresh);
    }, root);

    return () => {
      removeLoadListener();
      context.revert();
    };
  }, [reducedMotion]);

  return (
    <InternalPageShell title="About" showAmbient={false}>
      <div ref={pageRef} className={styles.page}>
        <header id="origin" className={styles.hero} tabIndex="-1">
          <div className={styles.heroCopy}>
            <span className={styles.chapterLabel} data-opening-copy>ABOUT / 01</span>
            <h1>
              <span className={styles.lineMask}><span data-opening-line>I followed curiosity</span></span>
              <span className={styles.lineMask}><span data-opening-line>until ideas became real.</span></span>
            </h1>
            <p data-opening-copy>Computer science gave me the starting point. Projects, constraints, and people taught me what engineering asks for.</p>
          </div>
          <figure className={styles.heroPortrait}>
            <img src="/images/hero-chetan-editorial.jpeg" alt="Chetan Mandiga seated in a black-and-white portrait" />
            <span className={styles.portraitCurtain} aria-hidden="true" />
          </figure>
        </header>

        <section id="college" className={styles.education} tabIndex="-1" aria-labelledby="education-title">
          <div className={styles.sectionIntro} data-reveal>
            <span className={styles.chapterLabel}>THE BEGINNING / 02</span>
            <h2 id="education-title">Four years of figuring out what kind of engineer I wanted to become.</h2>
          </div>
          <StoryWorkspace label="Education archive" meta="2021 - 2025" className={styles.educationWorkspace}>
            <div className={styles.educationImage} data-panel>
              <img src="/images/drift-wall/drift-11.jpeg" alt="Chetan on the BML Munjal University campus" loading="lazy" />
            </div>
            <div className={styles.educationIdentity} data-panel>
              <span>BML Munjal University</span>
              <h3>Computer Science &amp; Engineering</h3>
              <p>Minor in Entrepreneurship</p>
              <ContextChips items={["2021 - 2025", "Computer science", "Entrepreneurship"]} label="Education context" />
            </div>
            <p className={styles.educationNote} data-panel>College became a place to learn the idea, test it by building, and follow the questions that appeared next.</p>
          </StoryWorkspace>
        </section>

        <section id="exploration" className={styles.exploration} tabIndex="-1" aria-labelledby="exploration-title">
          <div className={styles.sectionIntroCompact} data-reveal>
            <span className={styles.chapterLabel}>EXPLORATION / 03</span>
            <h2 id="exploration-title">I explored first. Then I learned how the pieces connect.</h2>
            <p>These were directions I discovered and tested, not boxes I collected.</p>
          </div>

          <StoryWorkspace label="Exploration workspace" meta="Learning through making" className={styles.explorationWorkspace}>
            <div className={styles.explorationGrid}>
              <ExplorationArtifact className={styles.artifactPython} title="Python + software development">Python made ideas quick enough to test. Software development made me ask how those ideas could become stable systems. Problem solving connected both.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactWeb} title="Web + project building">Interfaces turned abstract logic into something another person could use. Projects made the whole path concrete.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactAi} title="AI / ML + data">Data introduced patterns and uncertainty. AI introduced a new way to ask what software could infer, generate, and adapt to.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactVision} title="Computer vision">Images and video became data that software could reason about.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactBusiness} title="Entrepreneurship">Ideas also need people, timing, value, and a reason to exist.</ExplorationArtifact>
            </div>
          </StoryWorkspace>

          <div className={styles.railHeading} data-reveal>
            <h3>Artifacts from the wider journey</h3>
            <p>Drag, swipe, or use the wheel. Open any frame for context.</p>
          </div>
          <ArtifactRail artifacts={ARTIFACTS} />
        </section>

        <section id="real-world" className={styles.realWorld} tabIndex="-1" aria-labelledby="real-world-title">
          <div className={styles.realWorldStatement} data-reveal>
            <span className={styles.chapterLabel}>REAL WORLD / 04</span>
            <h2 id="real-world-title">Then the problems stopped being assignments.<br /><strong>They became real.</strong></h2>
          </div>
          <div className={styles.journey} aria-label="Progression from classroom learning to real systems">
            <span className={styles.journeyTrack} aria-hidden="true"><i className={styles.journeyFill} /></span>
            {["Classroom", "Experiments", "Internships", "Live projects", "Real systems"].map((step) => (
              <span key={step} className={styles.journeyStep}>{step}</span>
            ))}
          </div>
          <p className={styles.realWorldCopy} data-reveal>College taught me how to learn and build. Real-world environments added constraints, collaboration, users, reliability, and responsibility.</p>
          <div className={styles.experienceMarkers} aria-label="Professional chapter markers">
            {[
              ["DRDO", "Research environment"],
              ["Innodatatics", "Applied AI environment"],
              ["HCLTech", "Enterprise environment"],
            ].map(([name, context]) => (
              <div key={name} className={styles.experienceMarker}>
                <strong>{name}</strong>
                <span>{context}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.lessons} aria-labelledby="lessons-title">
          <div className={styles.lessonsLead} data-reveal>
            <span className={styles.chapterLabel}>WHAT CHANGED / 05</span>
            <h2 id="lessons-title">A model is not a product.</h2>
            <p>Capability matters. So do context, reliability, explanation, and the experience around it.</p>
          </div>
          <div className={styles.lessonSplit}>
            <article data-reveal>
              <h3>Technically correct does not always mean useful.</h3>
              <p>The real question is whether the result helps someone make progress.</p>
            </article>
            <article data-reveal>
              <h3>Repetition usually points toward automation.</h3>
              <p>Repeated effort can reveal a process worth making calmer and more dependable.</p>
            </article>
          </div>
          <LessonFold title="Interfaces matter because someone eventually has to use the system.">
            <p>The interface is where a system explains itself. It should make the result easier to inspect, understand, and act on.</p>
          </LessonFold>
          <p className={styles.lessonClosing} data-reveal>I enjoy owning the distance between an idea and something usable.</p>
        </section>

        <section id="today" className={styles.today} tabIndex="-1" aria-labelledby="today-title">
          <div className={styles.todayIntro} data-reveal>
            <span className={styles.chapterLabel}>TODAY / 06</span>
            <h2 id="today-title">Most of my curiosity sits somewhere between software and intelligence.</h2>
            <p>This is not a proficiency map. It is a snapshot of the questions pulling my attention now.</p>
          </div>
          <StoryWorkspace label="Current curiosity" meta="Select a direction" className={styles.todayWorkspace}>
            <div className={styles.curiosityList} aria-label="Current areas of curiosity">
              {CURIOSITIES.map(([title], index) => (
                <button
                  key={title}
                  type="button"
                  className={activeCuriosity === index ? styles.curiosityActive : undefined}
                  aria-pressed={activeCuriosity === index}
                  onMouseEnter={() => setActiveCuriosity(index)}
                  onFocus={() => setActiveCuriosity(index)}
                  onClick={() => setActiveCuriosity(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {title}
                </button>
              ))}
            </div>
            <div className={styles.curiosityFocus} aria-live="polite">
              <span>Current focus</span>
              <h3>{CURIOSITIES[activeCuriosity][0]}</h3>
              <p>{CURIOSITIES[activeCuriosity][1]}</p>
            </div>
          </StoryWorkspace>
        </section>

        <section className={styles.closing} aria-label="Personal closing statement">
          <p data-reveal>I do not think becoming an engineer has been one perfectly straight path. Most of it has been curiosity, building something, discovering what I do not understand yet, and using the next project to close that gap.</p>
        </section>

        <section className={styles.finalCta} aria-labelledby="about-final-title">
          <div data-reveal>
            <span>Enough about me.</span>
            <h2 id="about-final-title">Here is what I have built.</h2>
            <a href="/work">Explore the work <span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </div>
    </InternalPageShell>
  );
}
