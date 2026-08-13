import React, { useState } from "react";
import InternalPageShell, { EditorialCTA, SectionHeader } from "../components/InternalPageShell.jsx";
import styles from "./InternalPages.module.css";

const LIFE_ITEMS = [
  ["/images/drift-wall/drift-02.jpeg", "Play", "Energy, movement, and room for surprise.", "50% 38%"],
  ["/images/drift-wall/drift-01.jpeg", "Cooking", "Food as a creative process and a reason to gather.", "50% 30%"],
  ["/images/drift-wall/drift-03.jpeg", "Culture", "Anime and visual worlds that reward attention to detail.", "50% 14%"],
  ["/images/drift-wall/drift-06.jpeg", "Photography", "Night scenes, signs, and ordinary places with atmosphere.", "50% 62%"],
  ["/images/drift-wall/drift-05.jpeg", "Music", "A soundtrack for focus, movement, and changing pace.", "50% 15%"],
  ["/images/drift-wall/drift-04.jpeg", "Experiments", "Personal images that mix everyday moments with imagination.", "50% 54%"],
];

const PROMPTS = ["Ask about my projects", "Ask what I am learning", "Ask about my experience", "Ask what I do outside coding"];

function AskForm() {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      setStatus("Enter a question before submitting.");
      return;
    }

    setStatus("Opening your mail app with the question prepared.");
    const subject = encodeURIComponent("Question from the Beyond page");
    const body = encodeURIComponent(`${trimmed}\n\nSent from the portfolio Beyond page.`);
    window.location.href = `mailto:chetansrikantmandiga@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <form className={styles.askForm} onSubmit={submit} noValidate>
      <div className={styles.goo} aria-hidden="true" />
      <label className={styles.eyebrow} htmlFor="beyond-question">Ask me anything</label>
      <div className={styles.askField}>
        <input id="beyond-question" value={question} onChange={(event) => { setQuestion(event.target.value); setStatus(""); }} placeholder="Type a question about the work or the person behind it" autoComplete="off" />
        <button type="submit">Draft email</button>
      </div>
      <p className={styles.formStatus} role="status">{status || "No automated assistant is simulated. Submitting prepares a real email."}</p>
      <div className={styles.promptRow} aria-label="Suggested questions">{PROMPTS.map((prompt) => <button key={prompt} type="button" onClick={() => { setQuestion(prompt); setStatus(""); }}>{prompt}</button>)}</div>
    </form>
  );
}

export default function BeyondPage() {
  return (
    <InternalPageShell title="Beyond">
      <header className={`${styles.pageHero} ${styles.perspectiveHero}`}>
        <div className={styles.heroGridWide}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Beyond / Personal archive</span>
            <h1 className={styles.perspectiveTitle}>There is more to the person than the stack.</h1>
            <p>A visual journal of food, movement, culture, photography, music, and the curiosity that continues outside engineering.</p>
            <span className={styles.heroMeta}>Personal media / No Gundam required</span>
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Life grid" title="Moments that do not fit inside a technology list." copy="Real personal media arranged as an editorial wall rather than a social feed." />
          <div className={styles.lifeGrid}>
            {LIFE_ITEMS.map(([image, title, copy, focus]) => <figure key={title} className={styles.lifeCard} style={{ "--focus": focus }}><img src={image} alt={`${title} moment from Chetan's personal archive`} loading="lazy" /><figcaption className={styles.cardCaption}><h3>{title}</h3><p>{copy}</p></figcaption></figure>)}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Interests" title="Different practices, one appetite for learning." />
          <div className={styles.interestBlocks}>
            <article className={styles.interestBlock}><h3>Fitness and basketball</h3><p>Movement adds a different kind of discipline: repetition, awareness, and the satisfaction of incremental improvement without turning it into a motivational slogan.</p></article>
            <article className={styles.interestBlock}><h3>Cooking and shared tables</h3><p>Cooking is another system of timing, iteration, and taste. The personal archive shows the creative side without making an unsupported claim about formal Culinary Club responsibilities.</p></article>
            <article className={styles.interestBlock}><h3>Anime and culture</h3><p>Visual storytelling, designed worlds, and memorable motion influence how I notice composition and character without turning this page into a fandom catalogue.</p></article>
            <article className={styles.interestBlock}><h3>Travel and photography</h3><p>The available images are treated as atmosphere and observation. Locations and dates are intentionally omitted until verified metadata is supplied.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Music" title="Atmosphere stays user-controlled." copy="No legally shippable audio asset was supplied, so this release does not imitate a player or autoplay media. A real player can be enabled when an owned or licensed track is available." />
          <p className={styles.musicNotice}>Playback status / intentionally unavailable<br />Reason / no verified audio asset in the project</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Ask / Contact" title="A real question deserves a real reply." copy="The gooey treatment wraps a semantic form. Because no verified assistant service exists in this project, submission prepares an email rather than fabricating a chatbot response." />
          <AskForm />
        </div>
      </section>

      <EditorialCTA eyebrow="Open channel" title="Talk about a project, an idea, or something unrelated." actions={[{ label: "Send an email", href: "mailto:chetansrikantmandiga@gmail.com" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/chetan-srikant-mandiga-514784248/", external: true }, { label: "GitHub", href: "https://github.com/ChetanSrikant", external: true }]} />
    </InternalPageShell>
  );
}
