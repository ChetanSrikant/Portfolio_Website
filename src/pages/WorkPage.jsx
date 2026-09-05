import React, { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AetherField from "../components/AetherField.jsx";
import InternalPageShell, { EditorialCTA, PageHero, SectionHeader } from "../components/InternalPageShell.jsx";
import MediaLightbox from "../components/MediaLightbox.jsx";
import SystemIllustration from "../components/SystemIllustration.jsx";
import styles from "./InternalPages.module.css";

gsap.registerPlugin(ScrollTrigger);

const CASES = [
  { id: "tgsrtc", number: "01", title: "TGSRTC Public Transport Demand Platform", category: "Applied AI / Forecasting / Decision Support", problem: "Make public-transport forecasting outputs easier to inspect, explore, and communicate." },
  { id: "rag", number: "02", title: "Conversational RAG Application", category: "GenAI / Retrieval", problem: "Keep multi-turn answers grounded in retrieved source material." },
  { id: "vision", number: "03", title: "Computer Vision Image Search", category: "Vision / Retrieval", problem: "Make image collections searchable through detected visual content." },
];

const RAG_STATES = [
  ["Question received", "The interface accepts a user question and passes it into the conversation state."],
  ["Retrieving", "The retriever searches embedded document chunks for relevant source material."],
  ["Context selected", "Relevant chunks are attached to the current state before generation."],
  ["Generating", "Groq inference produces an answer using the selected context."],
  ["Response grounded", "The response returns through the Streamlit interface with conversation state preserved."],
];

const RAG_PRODUCT_VISUAL = {
  eyebrow: "Product view / Conceptual",
  title: "Grounded answers, visible sources.",
  copy: "A visual interpretation of the verified retrieval flow: question, sources, grounded answer, and conversation state in one inspectable interface.",
  items: [
    {
      src: "/images/work/conversational-rag-phone.png",
      alt: "Conceptual dark-mode Conversational RAG interface displayed on a phone held in one hand",
      caption: "Interface study / conceptual, not a production screenshot",
      fit: "contain",
    },
  ],
};

const VISION_PRODUCT_VISUAL = {
  eyebrow: "Visual evidence / Search pipeline",
  title: "From pixels to an inspectable index.",
  copy: "Three compact records show the source context, the object collection, and the detection metadata that supports visual retrieval.",
  items: [
    {
      src: "/images/work/computer-vision/vision-times-square.webp",
      alt: "A city street scene used as visual-search source context",
      caption: "01 / Source context",
    },
    {
      src: "/images/work/computer-vision/vision-object-collection.webp",
      alt: "A collection of varied objects arranged for visual-search reference",
      caption: "02 / Object collection",
    },
    {
      src: "/images/work/computer-vision/vision-detections.webp",
      alt: "A city image with object-detection labels and bounding boxes",
      caption: "03 / Detection metadata",
    },
  ],
};

const EVIDENCE = [
  { type: "Architecture", title: "Forecasting decision flow", caption: "Shows the supported path from transport data to forecast interpretation. It does not claim operational deployment.", detail: "TRANSPORT DATA\n↓\nPREPARATION\n↓\nFORECAST\n↓\nINTERACTIVE ANALYSIS\n↓\nPLANNING CONTEXT" },
  { type: "Architecture", title: "Stateful RAG pipeline", caption: "Documents the retrieval and generation boundaries used by the conversational RAG application.", detail: "QUESTION → STREAMLIT → LANGGRAPH STATE\n↓\nRETRIEVER → HF EMBEDDINGS → CHUNKS\n↓\nGROQ → GROUNDED RESPONSE" },
  { type: "Pipeline", title: "Visual retrieval flow", caption: "Explains how detected objects become searchable image metadata and results.", detail: "IMAGE COLLECTION\n↓\nYOLOV11 DETECTION\n↓\nOBJECT INDEX\n↓\nQUERY MATCH\n↓\nRETRIEVED IMAGES" },
];

function Pipeline({ steps }) {
  return <div className={styles.pipeline}><SystemIllustration label="SYSTEM / VERIFIED FLOW" steps={steps} status="Architecture record" compact /></div>;
}

function AgentWorkspace() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const workspaceRef = React.useRef(null);

  useEffect(() => {
    const node = workspaceRef.current;
    if (!node || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % RAG_STATES.length), 2400);
    return () => window.clearInterval(timer);
  }, [visible]);

  return (
    <div ref={workspaceRef} className={styles.agentWorkspace}>
      <div className={styles.agentHeader}><span>AI agent workspace</span><span>Process state / {active + 1} of {RAG_STATES.length}</span></div>
      <div className={styles.agentBody}>
        <div className={styles.agentSteps} role="tablist" aria-label="RAG process states">
          {RAG_STATES.map(([label], index) => <button key={label} type="button" role="tab" aria-selected={active === index} className={`${styles.agentStep} ${active === index ? styles.agentStepActive : ""}`} onClick={() => setActive(index)}>{String(index + 1).padStart(2, "0")} / {label}</button>)}
        </div>
        <div className={styles.agentOutput} role="tabpanel" aria-live="polite"><strong>{RAG_STATES[active][0]}</strong><p>{RAG_STATES[active][1]}</p></div>
      </div>
    </div>
  );
}

function TgsrtcPublicRecord() {
  const recognitionPostUrl = "https://www.linkedin.com/feed/update/urn:li:ugcPost:7347936780177874944";
  const winningPostUrl = "https://www.linkedin.com/feed/update/urn:li:ugcPost:7346432007914037248";

  return (
    <section className={styles.tgsrtcPublicRecord} aria-labelledby="tgsrtc-public-record-title">
      <div className={styles.tgsrtcPublicRecordCopy}>
        <span className={styles.eyebrow}>Public record</span>
        <h3 id="tgsrtc-public-record-title">The recognition, in its original context.</h3>
        <p>
          These posts document the team, the challenge, and the winning solution. They are included here
          as external evidence alongside the technical case study.
        </p>
        <div className={styles.tgsrtcPublicRecordLinks}>
          <a href={recognitionPostUrl} target="_blank" rel="noreferrer">
            Open the recognition post
          </a>
          <a href={winningPostUrl} target="_blank" rel="noreferrer">
            Open the winning-solution post
          </a>
        </div>
      </div>

      <div className={styles.linkedinPostGrid}>
        <div className={styles.linkedinPostShell}>
          <div className={styles.linkedinPostHeader} aria-hidden="true">
            <span>LinkedIn</span>
            <span>Recognition post</span>
          </div>
          <div className={styles.linkedinPostViewport}>
            <span className={styles.linkedinPostLoading}>Loading recognition post</span>
            <iframe
              src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7347936780177874944?collapsed=1"
              height="627"
              width="504"
              frameBorder="0"
              allowFullScreen
              title="LinkedIn post documenting the TGSRTC challenge recognition"
            />
          </div>
        </div>

        <div className={styles.linkedinPostShell}>
          <div className={styles.linkedinPostHeader} aria-hidden="true">
            <span>LinkedIn</span>
            <span>Winning solution</span>
          </div>
          <div className={styles.linkedinPostViewport}>
            <span className={styles.linkedinPostLoading}>Loading winning-solution post</span>
            <iframe
              src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7346432007914037248?collapsed=1"
              height="627"
              width="504"
              frameBorder="0"
              allowFullScreen
              title="LinkedIn post documenting the TGSRTC winning solution"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CaseStudy({ item, context, contextLabel = "Context", problem, role, roleLabel = "Role", recognition, pipeline, implementation, outcome, lesson, visual, children }) {
  return (
    <section id={item.id} data-case={item.id} className={`${styles.section} ${styles.caseStudy}`}>
      <div className={styles.sectionInner}>
        <div className={styles.caseTitle}><span className={styles.number}>{item.number} / CASE STUDY</span><div><span className={styles.eyebrow}>{item.category}</span><h2>{item.title}</h2></div></div>
        {recognition ? (
          <aside className={styles.recognitionBand} aria-label="Public recognition">
            <span>{recognition.marker}</span>
            <div>
              <strong>{recognition.title}</strong>
              <p>{recognition.copy}</p>
            </div>
          </aside>
        ) : null}
        <div className={styles.caseMetaGrid}>
          <article className={styles.caseMeta}><h3>{contextLabel}</h3><p>{context}</p></article>
          <article className={styles.caseMeta}><h3>Problem</h3><p>{problem}</p></article>
          <article className={styles.caseMeta}><h3>{roleLabel}</h3><p>{role}</p></article>
        </div>
        {visual ? (
          <section className={styles.caseMediaPlate} aria-label={`${item.title} visual evidence`}>
            <div className={styles.caseMediaCopy}>
              <span className={styles.eyebrow}>{visual.eyebrow}</span>
              <strong>{visual.title}</strong>
              <p>{visual.copy}</p>
            </div>
            <div className={styles.caseMediaGrid}>
              {visual.items.map((media) => (
                <figure className={styles.caseMediaItem} key={media.src}>
                  <img
                    src={media.src}
                    alt={media.alt}
                    loading="lazy"
                    className={media.fit === "contain" ? styles.caseMediaContain : undefined}
                  />
                  <figcaption>{media.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}
        <Pipeline steps={pipeline} />
        <div className={styles.caseNotes}><div><h3>Implementation</h3><p>{implementation}</p></div><div><h3>Outcome and lesson</h3><p>{outcome} {lesson}</p></div></div>
        {children}
      </div>
    </section>
  );
}

export default function WorkPage() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const setLightbox = useCallback((index) => setLightboxIndex(index), []);
  const workPageRef = useRef(null);
  const openingRef = useRef(null);
  const heroRef = useRef(null);
  const indexRef = useRef(null);

  useEffect(() => {
    const page = workPageRef.current;
    const opening = openingRef.current;
    const hero = heroRef.current;
    const index = indexRef.current;
    if (!page || !opening || !hero || !index) return undefined;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(min-width: 701px) and (prefers-reduced-motion: no-preference)", () => {
        const copy = hero.querySelector(`.${styles.heroCopy}`);
        const field = hero.querySelector(`.${styles.workHeroField}`);
        const veil = hero.querySelector(`.${styles.workHeroVeil}`);
        const indexInner = index.querySelector(`.${styles.sectionInner}`);

        if (!copy || !field || !veil || !indexInner) return undefined;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: index,
            start: "top bottom",
            end: "top 22%",
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(indexInner, { y: 74, opacity: 0.58 }, { y: 0, opacity: 1, ease: "none" }, 0)
          .to(copy, { yPercent: -16, opacity: 0.28, ease: "none" }, 0)
          .to(field, { yPercent: 9, scale: 0.96, opacity: 0.42, ease: "none" }, 0)
          .to(veil, { opacity: 0.84, ease: "none" }, 0);

        return () => timeline.kill();
      });

      return () => media.revert();
    }, page);

    return () => context.revert();
  }, []);

  return (
    <InternalPageShell title="Work">
      <div ref={workPageRef} className={styles.workPage}>
      <div ref={openingRef} className={styles.workOpening}>
        <div ref={heroRef} className={styles.workAetherHero}>
          <AetherField className={styles.workHeroField} density={1.12} intensity={1} />
          <div className={styles.workHeroVeil} aria-hidden="true" />
          <PageHero eyebrow="Selected work" title="Not just what I built. How it works and what supports it." intro="Three case studies focused on context, architecture, implementation decisions, and evidence without unsupported impact claims." meta="Applied AI / Retrieval / Computer vision" />
        </div>

        <section ref={indexRef} className={`${styles.section} ${styles.sectionAlt} ${styles.workIndexSection}`}>
          <div className={styles.workIndexRail} aria-hidden="true"><span>Case files / 01—03</span><span>Scroll to examine</span></div>
          <div className={styles.sectionInner}>
            <SectionHeader eyebrow="Case study index" title="Three systems, examined beyond the surface." />
            <nav className={styles.caseIndex} aria-label="Case studies">{CASES.map((item) => <a key={item.id} href={`#${item.id}`}><span className={styles.number}>{item.number}</span><strong>{item.title}</strong><small>{item.category}<br />{item.problem}</small></a>)}</nav>
          </div>
        </section>
      </div>

      <CaseStudy
        item={CASES[0]}
        contextLabel="Team context"
        context="The solution was developed by the Innodatatics team during my internship as its entry for the TGSRTC public-transport challenge. The recognition belongs to the team."
        problem="The challenge explored how AI-driven forecasting could help people understand and optimize public transport utilization for TGSRTC."
        roleLabel="My contribution"
        role="As part of the winning team, I contributed substantially to the web application used to surface and communicate the forecasting results. I focused on turning forecast outputs and related insights into an interface stakeholders could explore and understand."
        recognition={{
          marker: "Winning solution",
          title: "Winner — Telangana AI Rising / AI4TG Grand Challenge",
          copy: "Challenge: Optimizing Public Transport Utilization with AI. Innodatatics was publicly recognized as the winning team for this transport use case.",
        }}
        pipeline={["Data and forecasting output", "Web application", "Visual exploration", "Stakeholder interpretation"]}
        implementation="My work centered on the application and presentation layer: structuring forecast outputs so they could be inspected, compared, and communicated clearly through the web experience."
        outcome="The team solution was selected as the winning entry in its challenge category."
        lesson="The project reinforced that a forecast becomes useful when people can interpret it through a clear, dependable interface."
      >
        <TgsrtcPublicRecord />
      </CaseStudy>

      <CaseStudy item={CASES[1]} context="Document-grounded assistants need retrieval and conversation state to cooperate across multiple turns." problem="Preserve conversational context while retrieving relevant chunks and keeping generated answers connected to source material." role="Implemented the application flow using Streamlit, LangGraph state, Hugging Face embeddings, retrieval, and Groq inference." pipeline={["User question", "Streamlit", "LangGraph state", "Retriever", "HF embeddings", "Relevant chunks", "Groq", "Grounded response"]} implementation="LangGraph holds the conversational state. The retriever uses Hugging Face embeddings to select document chunks, and Groq inference generates a response from that context." outcome="The result is a multi-turn retrieval application whose architecture makes state, retrieval, and generation explicit." lesson="Future work would expand evaluation around retrieval quality, source coverage, and failure handling." visual={RAG_PRODUCT_VISUAL}><AgentWorkspace /></CaseStudy>

      <CaseStudy item={CASES[2]} context="Large image collections are difficult to search when their useful information exists only inside the pixels." problem="Detect visual objects, convert detections into searchable metadata, and return relevant images through a simple interface." role="Built the detection, indexing, query, and Streamlit presentation workflow described here." pipeline={["Image collection", "YOLOv11", "Object index", "Query", "Rank", "Results"]} implementation="YOLOv11 detects objects in source images. Detection labels become an index that a query can match before the interface presents relevant images." outcome="The verified result is a visual-search workflow connecting detection to retrieval." lesson="The limitations are tied to detector coverage, ambiguous labels, and the need for stronger ranking when many images share the same object class." visual={VISION_PRODUCT_VISUAL} />

      <section className={`${styles.section} ${styles.sectionAlt} ${styles.workEvidenceSection}`}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Technical evidence" title="What each artifact actually proves." copy="These are architecture and pipeline records. No screenshot or benchmark is implied where one has not been supplied." />
          <div className={styles.evidenceGrid}>{EVIDENCE.map((item, index) => <button key={item.title} type="button" className={styles.evidenceCard} onClick={() => setLightboxIndex(index)}><div className={styles.evidenceGraphic}>{item.type.toUpperCase()} / OPEN</div><div><h3>{item.title}</h3><p>{item.caption}</p></div></button>)}</div>
        </div>
      </section>

      <EditorialCTA eyebrow="More builds" title="Looking for the smaller experiments?" copy="Projects is the faster, broader view of prototypes, product builds, and learning experiments." actions={[{ label: "Explore all projects", href: "/projects" }, { label: "Start a conversation", href: "mailto:chetansrikantmandiga@gmail.com" }]} />
      <MediaLightbox items={EVIDENCE} index={lightboxIndex} onIndexChange={setLightbox} />
      </div>
    </InternalPageShell>
  );
}
