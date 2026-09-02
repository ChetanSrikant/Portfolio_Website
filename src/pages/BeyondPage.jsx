import React, { useEffect, useRef, useState } from "react";
import InternalPageShell from "../components/InternalPageShell.jsx";
import AetherField from "../components/AetherField.jsx";
import GooeyInput from "../components/GooeyInput.jsx";
import { ThreeDPaper } from "../shaders/3d-paper/ThreeDPaper.tsx";
import "@designcodeio/threeui/style.css";
import styles from "./BeyondPage.module.css";

const INFLUENCES = [
  {
    index: "01",
    label: "Movement",
    title: "Repetition changes the result.",
    copy: "Training and basketball keep the lesson honest: awareness matters, rhythm matters, and improvement is usually earned one unglamorous repetition at a time.",
  },
  {
    index: "02",
    label: "Taste",
    title: "Timing is part of the craft.",
    copy: "Cooking makes experimentation tangible. Ingredients create constraints, instinct enters the process, and the smallest adjustment can change the entire experience.",
  },
  {
    index: "03",
    label: "Observation",
    title: "The ordinary deserves a second look.",
    copy: "Photography slows the eye down. Light on metal, a sign after dark, or a frame inside a frame can turn an everyday moment into something worth remembering.",
  },
  {
    index: "04",
    label: "Worlds",
    title: "Imagination needs structure.",
    copy: "Anime, music, and designed worlds shape how I think about atmosphere. The strongest ideas have rules, tension, character, and a reason to keep exploring.",
  },
];

const ARCHIVE = [
  { src: "/images/drift-wall/drift-02.jpeg", alt: "Chetan beside an orange car surrounded by colourful balls", note: "Play / controlled chaos", className: styles.archiveWide },
  { src: "/images/drift-wall/drift-01.jpeg", alt: "Chetan enjoying noodles in a warm cinematic restaurant scene", note: "Taste / make it memorable", className: styles.archiveTall },
  { src: "/images/drift-wall/drift-03.jpeg", alt: "Chetan standing with colourful imagined characters inside an elevator", note: "Worlds / keep wonder close", className: styles.archivePortrait },
  { src: "/images/drift-wall/drift-06.jpeg", alt: "A blue ice cream shop sign photographed at night", note: "Frames / after dark", className: styles.archiveNight },
  { src: "/images/drift-wall/drift-11.jpeg", alt: "Chetan walking outdoors on a university campus", note: "Pace / room to think", className: styles.archiveCampus },
  { src: "/images/drift-wall/drift-05.jpeg", alt: "Chetan listening to music beside a translucent player interface", note: "Sound / change the tempo", className: styles.archiveSound },
];

const PROMPTS = [
  "What are you learning now?",
  "What influences your visual taste?",
  "What do you make outside work?",
];

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.visible = "true";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${className}`} style={{ "--reveal-delay": `${delay}ms` }}>
      {children}
    </div>
  );
}

function AskForm() {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("");

  const submit = (trimmed) => {
    setStatus("Your question is ready in your mail app.");
    const subject = encodeURIComponent("A question from the Beyond page");
    const body = encodeURIComponent(`${trimmed}\n\nSent from Chetan's portfolio.`);
    window.location.href = `mailto:chetansrikantmandiga@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className={styles.askForm}>
      <GooeyInput
        value={question}
        onValueChange={(next) => {
          setQuestion(next);
          setStatus("");
        }}
        onSubmit={submit}
        placeholder="Ask something that is not on the résumé"
        submitLabel="Prepare question email"
      />
      <p className={styles.formStatus} role="status">
        {status || "Submitting opens a real email. No simulated assistant in between."}
      </p>
      <div className={styles.promptRow} aria-label="Suggested questions">
        {PROMPTS.map((prompt) => (
          <button key={prompt} type="button" onClick={() => setQuestion(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BeyondPage() {
  return (
    <InternalPageShell title="Beyond" showAmbient={false}>
      <header className={styles.hero}>
        <img
          className={styles.heroImage}
          src="/images/drift-wall/drift-12.jpeg"
          alt="Chetan seated in a field with a horse standing behind him"
          fetchpriority="high"
        />
        <div className={styles.heroVeil} aria-hidden="true" />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Beyond / 00</span>
          <h1>Off<br />script.</h1>
          <div className={styles.heroFooter}>
            <p>The work tells you what I can build. This is where the instincts behind it come from.</p>
            <a href="#field-notes">Explore the field notes <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <span className={styles.heroIndex} aria-hidden="true">PERSON / PROCESS / PLAY</span>
      </header>

      <div>
        <section id="field-notes" className={styles.manifesto}>
          <AetherField className={styles.manifestoField} density={1.16} intensity={1} />
          <Reveal className={styles.manifestoInner}>
            <span className={styles.eyebrow}>A wider frame / 01</span>
            <p className={styles.manifestoLead}>
              Code is one part of the picture. The rest is built from movement, a good meal, loud music, designed worlds, and the habit of noticing what others pass by.
            </p>
            <p className={styles.manifestoAside}>
              I do not separate curiosity into professional and personal versions. The same instinct that makes me inspect a system also makes me chase a stronger frame, a better rhythm, or a stranger idea.
            </p>
          </Reveal>
        </section>

        <section className={styles.influenceSection}>
          <div className={styles.sectionIntro}>
            <span className={styles.eyebrow}>What stays with me / 02</span>
            <h2>Four frequencies.<br />One point of view.</h2>
          </div>
          <div className={styles.influenceList}>
            {INFLUENCES.map((item, index) => (
              <Reveal key={item.index} delay={index * 55}>
                <article className={styles.influenceRow}>
                  <span className={styles.influenceIndex}>{item.index}</span>
                  <span className={styles.influenceLabel}>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={styles.paperSection} aria-labelledby="material-study-title">
          <div className={styles.paperInner}>
            <Reveal className={styles.paperCopy}>
              <span className={styles.eyebrow}>Personal signal / 03</span>
              <h2 id="material-study-title">Ideas should feel tangible.</h2>
              <p>I build AI products and interfaces that turn dense systems into experiences people can understand, trust, and use. This glass field note captures that belief: structure beneath the surface, movement with intent.</p>
              <dl>
                <div><dt>Focus</dt><dd>Applied AI + product</dd></div>
                <div><dt>Method</dt><dd>Systems into interfaces</dd></div>
                <div><dt>Explore</dt><dd>Drag + hover</dd></div>
              </dl>
            </Reveal>
            <div className={styles.paperStage}>
              <div className={styles.paperStageRail} aria-hidden="true"><span>Interactive builder profile</span><span>Chetan / 3D field note</span></div>
              <ThreeDPaper className={styles.paperFrame} />
              <p className={styles.paperNote}>A personal identity study in glass, light, and motion. Drag to inspect it; move the pointer to shape the light.</p>
            </div>
          </div>
        </section>

        <section className={styles.archiveSection}>
          <AetherField className={styles.archiveField} density={0.92} intensity={0.9} />
          <div className={styles.archiveHeading}>
            <span className={styles.eyebrow}>Personal archive / 04</span>
            <h2>Proof that life rarely stays inside the grid.</h2>
            <p>Fragments, experiments, places, and imagined moments, kept for atmosphere rather than documentation.</p>
          </div>
          <div className={styles.archiveGrid}>
            {ARCHIVE.map((item, index) => (
              <Reveal key={item.src} className={item.className} delay={(index % 3) * 70}>
                <figure className={styles.archiveFigure}>
                  <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                  <figcaption>{item.note}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={styles.bridgeSection}>
          <Reveal className={styles.bridgeInner}>
            <span className={styles.bridgeNumber}>05</span>
            <div>
              <span className={styles.eyebrow}>Back to the work</span>
              <h2>These interests do not sit beside the process. They shape it.</h2>
            </div>
            <ul>
              <li><span>Sport</span> teaches pace and recovery.</li>
              <li><span>Cooking</span> teaches timing and iteration.</li>
              <li><span>Photography</span> teaches hierarchy and focus.</li>
              <li><span>Storytelling</span> teaches systems need character.</li>
            </ul>
          </Reveal>
        </section>

        <section className={styles.contactSection}>
          <div className={styles.contactInner}>
            <Reveal>
              <span className={styles.eyebrow}>Open channel / 06</span>
              <h2>Ask the question the portfolio did not answer.</h2>
            </Reveal>
            <Reveal delay={100}>
              <AskForm />
            </Reveal>
          </div>
        </section>

        <section className={styles.finalCta}>
          <AetherField className={styles.finalField} density={0.88} intensity={0.88} />
          <div>
            <span className={styles.eyebrow}>Continue the conversation / 07</span>
            <h2>Work, ideas,<br />or the spaces between.</h2>
          </div>
          <nav className={styles.contactLinks} aria-label="Contact links">
            <a href="mailto:chetansrikantmandiga@gmail.com">Email <span aria-hidden="true">↗</span></a>
            <a href="https://www.linkedin.com/in/chetan-srikant-mandiga-514784248/" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            <a href="https://github.com/ChetanSrikant" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </nav>
        </section>
      </div>
    </InternalPageShell>
  );
}
