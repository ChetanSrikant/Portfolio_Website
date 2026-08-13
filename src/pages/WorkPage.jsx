import React, { useCallback, useEffect, useState } from "react";
import InternalPageShell, { EditorialCTA, PageHero, SectionHeader } from "../components/InternalPageShell.jsx";
import MediaLightbox from "../components/MediaLightbox.jsx";
import styles from "./InternalPages.module.css";

const CASES = [
  { id: "tgsrtc", number: "01", title: "TGSRTC Public Transport Demand Platform", category: "Applied AI / Forecasting", problem: "Turn transport-demand data into a workflow for forecast, exploration, and planning." },
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

const EVIDENCE = [
  { type: "Architecture", title: "Forecasting decision flow", caption: "Shows the supported path from transport data to forecast interpretation. It does not claim operational deployment.", detail: "TRANSPORT DATA\n↓\nPREPARATION\n↓\nFORECAST\n↓\nINTERACTIVE ANALYSIS\n↓\nPLANNING CONTEXT" },
  { type: "Architecture", title: "Stateful RAG pipeline", caption: "Documents the retrieval and generation boundaries used by the conversational RAG application.", detail: "QUESTION → STREAMLIT → LANGGRAPH STATE\n↓\nRETRIEVER → HF EMBEDDINGS → CHUNKS\n↓\nGROQ → GROUNDED RESPONSE" },
  { type: "Pipeline", title: "Visual retrieval flow", caption: "Explains how detected objects become searchable image metadata and results.", detail: "IMAGE COLLECTION\n↓\nYOLOV11 DETECTION\n↓\nOBJECT INDEX\n↓\nQUERY MATCH\n↓\nRETRIEVED IMAGES" },
];

function Pipeline({ steps }) {
  return <div className={styles.pipeline} aria-label={steps.join(" then ")}>{steps.map((step, index) => <React.Fragment key={step}><div className={styles.pipelineStep}>{step}</div>{index < steps.length - 1 && <span className={styles.pipelineArrow} aria-hidden="true">→</span>}</React.Fragment>)}</div>;
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

function CaseStudy({ item, context, problem, role, pipeline, implementation, outcome, lesson, children }) {
  return (
    <section id={item.id} className={`${styles.section} ${styles.caseStudy}`}>
      <div className={styles.sectionInner}>
        <div className={styles.caseTitle}><span className={styles.number}>{item.number} / CASE STUDY</span><div><span className={styles.eyebrow}>{item.category}</span><h2>{item.title}</h2></div></div>
        <div className={styles.caseMetaGrid}>
          <article className={styles.caseMeta}><h3>Context</h3><p>{context}</p></article>
          <article className={styles.caseMeta}><h3>Problem</h3><p>{problem}</p></article>
          <article className={styles.caseMeta}><h3>Role</h3><p>{role}</p></article>
        </div>
        <Pipeline steps={pipeline} />
        <div className={styles.caseNotes}><div><h3>Implementation</h3><p>{implementation}</p></div><div><h3>Outcome and lesson</h3><p>{outcome} {lesson}</p></div></div>
        {children}
      </div>
    </section>
  );
}

export default function WorkPage() {
  const [lightboxItem, setLightboxItem] = useState(null);
  const closeLightbox = useCallback(() => setLightboxItem(null), []);

  return (
    <InternalPageShell title="Work">
      <PageHero eyebrow="Selected work" title="Not just what I built. How it works and what supports it." intro="Three case studies focused on context, architecture, implementation decisions, and evidence without unsupported impact claims." meta="Applied AI / Retrieval / Computer vision" />

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Case study index" title="Three systems, examined beyond the surface." />
          <nav className={styles.caseIndex} aria-label="Case studies">{CASES.map((item) => <a key={item.id} href={`#${item.id}`}><span className={styles.number}>{item.number}</span><strong>{item.title}</strong><small>{item.category}<br />{item.problem}</small></a>)}</nav>
        </div>
      </section>

      <CaseStudy item={CASES[0]} context="Public transport demand planning requires moving from historical ridership information to a forecast that a planner can inspect and interpret." problem="Create a coherent workflow connecting data preparation, demand forecasting, interactive exploration, and a domain-focused assistant." role="Built the applied-AI workflow and product interface represented here. Adoption, accuracy, and organizational impact are intentionally not claimed without verified evidence." pipeline={["Ridership and routes", "Prepare", "Forecast", "Explore", "Plan"]} implementation="The platform organizes the forecasting workflow around a Streamlit interface, keeping forecasts and guided interpretation close to the planning task instead of presenting a model output in isolation." outcome="The verified result is a working demand-analysis workflow combining forecasting, interactive analysis, and an assistant layer." lesson="The next evidence priority is a documented evaluation set and clearer comparison between model choices." />

      <CaseStudy item={CASES[1]} context="Document-grounded assistants need retrieval and conversation state to cooperate across multiple turns." problem="Preserve conversational context while retrieving relevant chunks and keeping generated answers connected to source material." role="Implemented the application flow using Streamlit, LangGraph state, Hugging Face embeddings, retrieval, and Groq inference." pipeline={["User question", "Streamlit", "LangGraph state", "Retriever", "HF embeddings", "Relevant chunks", "Groq", "Grounded response"]} implementation="LangGraph holds the conversational state. The retriever uses Hugging Face embeddings to select document chunks, and Groq inference generates a response from that context." outcome="The result is a multi-turn retrieval application whose architecture makes state, retrieval, and generation explicit." lesson="Future work would expand evaluation around retrieval quality, source coverage, and failure handling."><AgentWorkspace /></CaseStudy>

      <CaseStudy item={CASES[2]} context="Large image collections are difficult to search when their useful information exists only inside the pixels." problem="Detect visual objects, convert detections into searchable metadata, and return relevant images through a simple interface." role="Built the detection, indexing, query, and Streamlit presentation workflow described here." pipeline={["Image collection", "YOLOv11", "Object index", "Query", "Rank", "Results"]} implementation="YOLOv11 detects objects in source images. Detection labels become an index that a query can match before the interface presents relevant images." outcome="The verified result is a visual-search workflow connecting detection to retrieval." lesson="The limitations are tied to detector coverage, ambiguous labels, and the need for stronger ranking when many images share the same object class." />

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <SectionHeader eyebrow="Technical evidence" title="What each artifact actually proves." copy="These are architecture and pipeline records. No screenshot or benchmark is implied where one has not been supplied." />
          <div className={styles.evidenceGrid}>{EVIDENCE.map((item) => <button key={item.title} type="button" className={styles.evidenceCard} onClick={() => setLightboxItem(item)}><div className={styles.evidenceGraphic}>{item.type.toUpperCase()} / OPEN</div><div><h3>{item.title}</h3><p>{item.caption}</p></div></button>)}</div>
        </div>
      </section>

      <EditorialCTA eyebrow="More builds" title="Looking for the smaller experiments?" copy="Projects is the faster, broader view of prototypes, product builds, and learning experiments." actions={[{ label: "Explore all projects", href: "/projects" }, { label: "Start a conversation", href: "mailto:chetansrikantmandiga@gmail.com" }]} />
      <MediaLightbox item={lightboxItem} onClose={closeLightbox} />
    </InternalPageShell>
  );
}
