import React from "react";
import InternalPageShell, { EditorialCTA, PageHero, SectionHeader } from "../components/InternalPageShell.jsx";
import LanguageSolarSystem from "../components/LanguageSolarSystem.jsx";
import PortfolioGlobe from "../components/PortfolioGlobe.jsx";
import styles from "./InternalPages.module.css";

const THINKING = [
  ["01", "Build", "Move from an idea to something testable, then let the working system sharpen the question."],
  ["02", "Understand", "Learn enough of the underlying system to make decisions that hold up beyond the demo."],
  ["03", "Experiment", "Use focused prototypes to discover what should exist before polishing what should not."],
  ["04", "Explain", "Make the result legible through interfaces, evidence, and direct technical communication."],
];

const DIRECTIONS = [
  ["AI applications", "Building systems where models are one part of a useful, understandable product."],
  ["Software architecture", "Improving how application boundaries, data flow, and failure modes are designed."],
  ["Backend engineering", "Strengthening APIs, state, integrations, and the operational side of software."],
  ["DSA and problem solving", "Maintaining the fundamentals needed to reason clearly under constraints."],
];

const PREVIEW = [
  ["/images/drift-wall/drift-02.jpeg", "Photography", "Composed scenes and unexpected details.", "50% 35%"],
  ["/images/drift-wall/drift-01.jpeg", "Food", "Cooking, visual experiments, and shared tables.", "50% 27%"],
  ["/images/drift-wall/drift-03.jpeg", "Culture", "Anime, music, and the references that shape visual taste.", "50% 18%"],
];

export default function AboutPage() {
  return (
    <InternalPageShell title="About">
      <PageHero
        eyebrow="About / Profile"
        title="I understand how things work, then build something useful from that understanding."
        intro="I am a developer focused on applied AI, software engineering, experimentation, and the product decisions that turn technical capability into a usable system."
        meta="Builder / Learner / Systems thinker"
        media={<img src="/images/chetan-portrait.png" alt="Portrait of Chetan Mandiga" />}
      />

      <section className={styles.section}>
        <div className={`${styles.sectionInner} ${styles.introGrid}`}>
          <div><span className={styles.eyebrow}>Who I am</span><h2>A developer who likes the whole path.</h2></div>
          <div className={styles.prose}>
            <p>I enjoy moving between the model, backend, interface, and explanation instead of treating them as isolated concerns.</p>
            <p><strong>Applied AI is most interesting to me when it becomes part of a dependable product:</strong> grounded by data, shaped by constraints, and clear enough for someone else to use.</p>
            <p>That approach also leaves room for curiosity. Small experiments often reveal the better question before a large implementation begins.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="How I think" title="Four actions I return to." copy="A practical loop for moving from uncertainty to a result that can be tested and explained." />
          <div className={styles.principleGrid}>
            {THINKING.map(([number, title, copy]) => <article key={title} className={styles.principle}><span className={styles.number}>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <LanguageSolarSystem />

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Current direction" title="What I am strengthening now." />
          <div className={styles.directionGrid}>
            {DIRECTIONS.map(([title, copy], index) => <article key={title} className={styles.directionItem}><span className={styles.number}>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <PortfolioGlobe />

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Beyond the stack" title="The interests behind the interfaces." copy="A short preview of the personal side. The full visual journal lives on Beyond." />
          <div className={styles.previewGrid}>
            {PREVIEW.map(([image, title, copy, focus]) => <a key={title} href="/beyond" className={styles.previewCard} style={{ "--focus": focus }}><img src={image} alt={`${title} from Chetan's personal archive`} loading="lazy" /><div className={styles.cardCaption}><h3>{title}</h3><p>{copy}</p></div></a>)}
          </div>
        </div>
      </section>

      <EditorialCTA eyebrow="Continue" title="See what this thinking becomes in practice." copy="Work contains the deeper technical evidence. Projects contains the wider set of experiments." actions={[{ label: "View selected work", href: "/work" }, { label: "Browse projects", href: "/projects" }, { label: "Go beyond", href: "/beyond" }]} />
    </InternalPageShell>
  );
}
