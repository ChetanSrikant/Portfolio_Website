import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InternalPageShell from "../components/InternalPageShell.jsx";
import LanguageSolarSystem from "../components/LanguageSolarSystem.jsx";
import PortfolioGlobe from "../components/PortfolioGlobe.jsx";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./AboutPage.module.css";

gsap.registerPlugin(ScrollTrigger);

const THINKING = [
  ["01", "Build", "Move from an idea to something testable quickly enough that the real problem can answer back."],
  ["02", "Understand", "Learn enough of the system beneath the interface to make decisions that survive beyond the demo."],
  ["03", "Experiment", "Use prototypes to discover what deserves refinement instead of polishing the wrong assumption."],
  ["04", "Explain", "Make the result legible through evidence, interfaces, diagrams, and direct technical communication."],
];

const DIRECTIONS = [
  ["NOW", "Applied AI products", "Building AI experiences where models sit inside understandable software instead of becoming the whole product."],
  ["DEEPENING", "Backend architecture", "Improving APIs, state, boundaries, data flow, integrations, and the failure modes behind polished interfaces."],
  ["PRACTICING", "DSA and problem solving", "Keeping the fundamentals sharp enough to reason cleanly when constraints matter more than tooling."],
  ["EXPLORING", "Agents and multimodal interfaces", "Testing retrieval systems, creative AI tools, and the product ideas they make possible."],
];

const SIDE_NOTES = [
  ["/images/drift-wall/drift-10.jpeg", "Observation", "I notice interfaces everywhere.", "Physical spaces, objects, signs, materials, and small interactions often become references for digital work.", "50% 52%"],
  ["/images/drift-wall/drift-11.jpeg", "Outside the stack", "Curiosity needs somewhere to wander.", "The rest of the story lives in movement, food, culture, photography, and things that have nothing to do with a framework.", "50% 28%"],
];

export default function AboutPage() {
  const pageRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const root = pageRef.current;
    if (!root || reducedMotion) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo("[data-about-hero]", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .08, ease: "power3.out" });
      gsap.utils.toArray("[data-about-reveal]").forEach((element) => {
        gsap.fromTo(element, { y: 26, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: .75,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true },
        });
      });
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <InternalPageShell title="About">
      <div ref={pageRef} className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <div className={styles.heroKicker} data-about-hero><span>ABOUT</span><span>AI / SOFTWARE / EXPERIMENTATION</span></div>
              <h1 data-about-hero>I build where <em>AI becomes software</em> people can actually use.</h1>
              <p className={styles.heroIntro} data-about-hero>I am Chetan. I move across the model, backend, interface, and evidence until an idea becomes real enough to test.</p>
              <div className={styles.heroSignals} data-about-hero>
                <div><span>Current mode</span><strong>Build, learn, refine</strong></div>
                <div><span>Bias</span><strong>Useful before impressive</strong></div>
                <div><span>Focus</span><strong>Applied AI and software</strong></div>
              </div>
            </div>
            <figure className={styles.heroPortrait} data-about-hero>
              <div className={styles.heroPortraitFrame}>
                <img src="/images/drift-wall/drift-12.jpeg" alt="Chetan in a black-and-white editorial portrait" />
                <span className={styles.heroImageIndex}>PORTRAIT / 12</span>
              </div>
              <figcaption><span>Outside the stack</span><span>Perspective matters as much as tooling.</span></figcaption>
            </figure>
          </div>
        </header>

        <section className={styles.profile} aria-labelledby="profile-heading">
          <div className={styles.inner}>
            <div className={styles.profileLead} data-about-reveal><span className={styles.eyebrow}>Profile</span><h2 id="profile-heading">I like the whole path.</h2></div>
            <div className={styles.profileBody} data-about-reveal>
              <p>The interesting part is rarely one isolated technology. It is the relationship between <strong>what the model can do, what the software must guarantee, and what the person using it needs to understand.</strong></p>
              <p>That is why I enjoy end-to-end work: enough AI to create leverage, enough engineering to make it dependable, and enough product thinking to make it obvious to use.</p>
              <p>Small experiments help me find the better question before committing to an expensive answer.</p>
            </div>
            <div className={styles.systemLine} data-about-reveal aria-label="Preferred build path"><span>MODEL</span><i /><span>LOGIC</span><i /><span>INTERFACE</span><i /><span>EVIDENCE</span></div>
          </div>
        </section>

        <section className={styles.thinking} aria-labelledby="thinking-heading">
          <div className={styles.inner}>
            <header className={styles.sectionHeader} data-about-reveal><div><span className={styles.eyebrow}>Operating loop</span><h2 id="thinking-heading">Four moves I return to.</h2></div><p>A practical loop for turning uncertainty into something that can be tested, understood, and explained.</p></header>
            <ol className={styles.thinkingList}>{THINKING.map(([number, title, copy]) => <li key={number} className={styles.thinkingRow} data-about-reveal><span>{number}</span><h3>{title}</h3><p>{copy}</p><i aria-hidden="true">+</i></li>)}</ol>
          </div>
        </section>

        <LanguageSolarSystem />

        <section className={styles.direction} aria-labelledby="direction-heading">
          <div className={styles.inner}>
            <header className={styles.sectionHeader} data-about-reveal><div><span className={styles.eyebrow}>Current trajectory</span><h2 id="direction-heading">What I am sharpening now.</h2></div><p>Not a mastery list. A snapshot of where the work is pulling my attention next.</p></header>
            <div className={styles.directionRail}>{DIRECTIONS.map(([status, title, copy], index) => <article key={status} className={styles.directionStep} data-about-reveal><div className={styles.directionMarker}>{String(index + 1).padStart(2, "0")}</div><span className={styles.directionStatus}>{status}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <PortfolioGlobe />

        <section className={styles.beyond} aria-labelledby="beyond-heading">
          <div className={styles.inner}>
            <header className={styles.beyondHeader} data-about-reveal><span className={styles.eyebrow}>Beyond the stack</span><h2 id="beyond-heading">The work is technical. The references are not always.</h2><a href="/beyond">Open the personal archive <span aria-hidden="true">↗</span></a></header>
            <div className={styles.sideNotes}>{SIDE_NOTES.map(([image, label, title, copy, focus], index) => <a href="/beyond" key={title} className={`${styles.sideNote} ${index === 1 ? styles.sideNoteOffset : ""}`} data-about-reveal><div className={styles.sideNoteMedia}><img src={image} alt="Personal archive preview" loading="lazy" style={{ objectPosition: focus }} /></div><div className={styles.sideNoteCopy}><span>{label}</span><h3>{title}</h3><p>{copy}</p></div></a>)}</div>
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="about-cta-heading">
          <div className={styles.finalCtaInner} data-about-reveal><div><span className={styles.eyebrow}>Continue</span><h2 id="about-cta-heading">The philosophy matters when the work proves it.</h2></div><div className={styles.finalCtaActions}><a href="/work">View selected work <span aria-hidden="true">↗</span></a><a href="/projects">Browse experiments <span aria-hidden="true">↗</span></a></div></div>
        </section>
      </div>
    </InternalPageShell>
  );
}
