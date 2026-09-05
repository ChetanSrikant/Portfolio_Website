import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InternalPageShell from "../components/InternalPageShell.jsx";
import CursorReactiveConstellationField from "../components/CursorReactiveConstellationField.jsx";
import ConvocationGallery from "../components/about/ConvocationGallery.jsx";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import { ThreeDPaper } from "../shaders/3d-paper/ThreeDPaper.tsx";
import "@designcodeio/threeui/style.css";
import {
  ContextChips,
  LessonFold,
  StoryWorkspace,
} from "../components/about/AboutStoryComponents.jsx";
import styles from "./AboutPage.module.css";

gsap.registerPlugin(ScrollTrigger);

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

const LANGUAGE_MARKS = [
  { name: "Python", src: "https://cdn.simpleicons.org/python/e0bb63" },
  { name: "JavaScript", src: "https://cdn.simpleicons.org/javascript/e0bb63" },
  { name: "React", src: "https://cdn.simpleicons.org/react/e0bb63" },
  { name: "Node.js", src: "https://cdn.simpleicons.org/nodedotjs/e0bb63" },
  { name: "TensorFlow", src: "https://cdn.simpleicons.org/tensorflow/e0bb63" },
  { name: "OpenCV", src: "https://cdn.simpleicons.org/opencv/e0bb63" },
];

const CONVOCATION_GALLERY = [
  {
    type: "image",
    src: "/images/about-education-convocation.png",
    alt: "Chetan Mandiga receiving recognition at the 2025 convocation",
    caption: "Recognition at BML Munjal University's 2025 convocation.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-01.jpeg",
    alt: "Chetan Mandiga with a friend outside the BML Munjal University campus after convocation",
    caption: "Convocation day with a friend on campus.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-02.jpeg",
    alt: "Chetan Mandiga holding his degree folder and convocation keepsake on campus",
    caption: "Degree folder in hand after the ceremony.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-03.jpeg",
    alt: "Chetan Mandiga standing with a friend outside the university after convocation",
    caption: "A campus portrait with a friend.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-04.jpeg",
    alt: "Chetan Mandiga and a classmate holding their convocation documents inside the ceremony venue",
    caption: "Inside the ceremony venue with a classmate.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-05.jpeg",
    alt: "Graduates celebrating together by tossing their convocation stoles into the air",
    caption: "The graduating group celebrates together.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-06.jpeg",
    alt: "Chetan Mandiga celebrating with friends inside the convocation venue",
    caption: "A celebration with friends after the ceremony.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-07.jpeg",
    alt: "Chetan Mandiga standing with a university faculty member after convocation",
    caption: "A photograph with a university faculty member.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-08.jpeg",
    alt: "Chetan Mandiga taking a selfie in front of the BML Munjal University campus",
    caption: "A convocation-day campus selfie.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-09.jpeg",
    alt: "Chetan Mandiga with fellow graduates and university faculty on campus",
    caption: "Graduates and faculty together on campus.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-10.jpeg",
    alt: "Chetan Mandiga taking a selfie with a fellow graduate outside the campus building",
    caption: "A courtyard selfie with a fellow graduate.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-11.jpeg",
    alt: "Chetan Mandiga taking a close selfie with a friend beneath colourful campus decorations",
    caption: "A final-day selfie beneath the campus decorations.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-12.jpeg",
    alt: "Chetan Mandiga holding convocation gifts and a certificate outside the ceremony building",
    caption: "Convocation gifts and the certificate after the ceremony.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-13.jpeg",
    alt: "Chetan Mandiga speaking with university faculty members after convocation",
    caption: "A conversation with faculty after the ceremony.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-14.jpeg",
    alt: "Chetan Mandiga taking a courtyard selfie with a fellow graduate",
    caption: "A courtyard selfie before leaving campus.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-15.jpeg",
    alt: "Chetan Mandiga standing beneath a campus banner after convocation",
    caption: "A portrait outside the ceremony building.",
  },
  {
    type: "image",
    src: "/media/convocation-gallery/convocation-16.jpeg",
    alt: "Chetan Mandiga speaking with a faculty member in the campus courtyard",
    caption: "One more conversation before the day ended.",
  },
  {
    type: "video",
    src: "/media/convocation-gallery/convocation-video.mp4",
    alt: "Convocation day video from BML Munjal University",
    caption: "A short video from convocation day.",
  },
];

const PROFESSIONAL_CHAPTERS = [
  {
    period: "2021 - 2025",
    organization: "BML Munjal University",
    role: "B.Tech, Computer Science and Engineering",
    location: "Gurugram, India",
    summary: "Built a computer science foundation while an entrepreneurship minor kept users, value, and delivery in the same frame.",
    tags: ["Computer science", "Entrepreneurship"],
  },
  {
    period: "May - Jul 2023",
    organization: "DRDO",
    role: "Project Intern",
    location: "Hyderabad, India",
    summary: "Designed Tkinter interfaces for RS-422 device communication, streamlining technical workflows and reducing communication errors.",
    tags: ["Python", "Tkinter", "RS-422"],
  },
  {
    period: "Mar - Aug 2025",
    organization: "Innodatatics",
    role: "Full Stack Data Scientist",
    location: "Hyderabad, India",
    summary: "Developed two AI data platforms: an enterprise forecasting dashboard and a TGSRTC public transport demand prediction system.",
    tags: ["AI forecasting", "Dashboards", "CRISP-ML(Q)", "Git workflows"],
    achievement: "Winner, Telangana AI Rising / AI4TG Grand Challenge",
  },
  {
    period: "Aug 2025 - Present",
    organization: "HCLTech",
    role: "Systems Engineer, IAM Cloud",
    location: "Noida, India",
    summary: "Support Active Directory and Azure AD environments across provisioning, access control, authentication, and hybrid identity operations.",
    tags: ["Active Directory", "Azure AD", "IAM", "Production systems"],
  },
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
  const galleryTriggerRef = useRef(null);
  const [activeCuriosity, setActiveCuriosity] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [portraitExpanded, setPortraitExpanded] = useState(false);
  const reducedMotion = useReducedMotionPreference();

  const movePortraitSpotlight = (event) => {
    if (reducedMotion || portraitExpanded) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  };

  const togglePortrait = () => setPortraitExpanded((expanded) => !expanded);

  const closeGallery = () => {
    setGalleryOpen(false);
    window.requestAnimationFrame(() => galleryTriggerRef.current?.focus());
  };

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
        .from(`.${styles.timelineFill}`, {
          scaleY: 0,
          duration: 1.3,
          ease: "power3.inOut",
        })
        .from(`.${styles.timelineEntry}`, { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" }, "-=0.8")
        .from(`.${styles.timelineDirection}`, { y: 12, autoAlpha: 0, duration: 0.5 }, "-=0.3");

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
    <InternalPageShell title="About" showAmbient={false} footerVariant="about">
      <div ref={pageRef} className={styles.page}>
        <div className={styles.constellationBackdrop}>
          <CursorReactiveConstellationField
            reducedMotion={reducedMotion}
            connectionOpacity={0.2}
            connectionLineWidth={1.25}
          />
        </div>
        <header id="origin" className={styles.hero} tabIndex="-1">
          <div className={styles.heroCopy}>
            <span className={styles.chapterLabel} data-opening-copy>ABOUT / 01</span>
            <h1>
              <span className={styles.lineMask}><span data-opening-line>I followed curiosity</span></span>
              <span className={styles.lineMask}><span data-opening-line>until ideas became real.</span></span>
            </h1>
            <p data-opening-copy>Computer science gave me the starting point. Projects, constraints, and people taught me what engineering asks for.</p>
          </div>
          <figure
            className={`${styles.heroPortrait} ${portraitExpanded ? styles.portraitExpanded : ""}`}
            tabIndex="0"
            role="button"
            aria-pressed={portraitExpanded}
            aria-label="Portrait of Chetan Mandiga. Move across the image to reveal colour, or activate it to keep the colour visible."
            onPointerMove={movePortraitSpotlight}
            onClick={togglePortrait}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                togglePortrait();
              }
            }}
          >
            <span className={styles.portraitVisual}>
              <img
                className={styles.portraitBase}
                src="/images/about-hero-campus.png"
                alt="Chetan Mandiga on the BML Munjal University campus"
                fetchpriority="high"
              />
              <img
                className={styles.portraitColor}
                src="/images/about-hero-campus.png"
                alt=""
                aria-hidden="true"
              />
            </span>
            <span className={styles.portraitRing} aria-hidden="true" />
            <figcaption className={styles.portraitHint}>
              {portraitExpanded ? "Colour / held" : "Move / reveal colour"}
            </figcaption>
            <span className={styles.portraitCurtain} aria-hidden="true" />
          </figure>
        </header>

        <section id="college" className={styles.education} tabIndex="-1" aria-labelledby="education-title">
          <div className={styles.sectionIntro} data-reveal>
            <span className={styles.chapterLabel}>THE BEGINNING / 02</span>
            <h2 id="education-title">Four years of figuring out what kind of engineer I wanted to become.</h2>
          </div>
          <StoryWorkspace label="Education archive" meta="2021 - 2025" className={styles.educationWorkspace}>
            <button
              ref={galleryTriggerRef}
              type="button"
              className={styles.educationImage}
              aria-haspopup="dialog"
              aria-label="Open the 2025 convocation photo and video gallery"
              onClick={() => setGalleryOpen(true)}
              data-panel
            >
              <img src="/images/about-education-convocation.png" alt="Chetan Mandiga receiving recognition at the 2025 convocation" loading="lazy" />
              <span className={styles.educationGalleryHint}>
                <span>Open convocation gallery</span>
                <small>17 photos + 1 video</small>
              </span>
            </button>
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
              <ExplorationArtifact className={styles.artifactPython} title="Python + software development">I used Python to connect retrieval, embeddings, model inference, and application state in a conversational RAG workflow.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactWeb} title="Web + project building">For the TGSRTC forecasting challenge, I helped turn model outputs into an interface stakeholders could inspect and understand.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactAi} title="AI / ML + data">Forecasting and retrieval projects taught me to treat data quality, evaluation, and failure handling as part of the product.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactVision} title="Computer vision">I built a YOLOv11 workflow that detects objects, indexes labels, and returns relevant images through a simple search interface.</ExplorationArtifact>
              <ExplorationArtifact className={styles.artifactBusiness} title="Entrepreneurship">My entrepreneurship minor keeps product value, users, and delivery constraints in the same frame as the engineering.</ExplorationArtifact>
            </div>
          </StoryWorkspace>

          <article className={styles.languageFeature} aria-labelledby="language-feature-title" data-reveal>
            <div className={styles.languageFeatureCopy}>
              <h3 id="language-feature-title">Languages became working material.</h3>
              <p>I learned each one by putting it under pressure: prototypes, interfaces, data experiments, and systems that had to behave beyond the demo.</p>
            </div>
          <figure className={styles.languageFeatureMedia}>
            <video
              key={reducedMotion ? "reduced-motion" : "motion"}
              src="/media/tech-stack-showcase.mp4"
              autoPlay={!reducedMotion}
              controls={reducedMotion}
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="Programming languages and technologies moving across the screen"
            />
          </figure>
            <ul className={styles.languageMarks} aria-label="Languages and tools used across projects">
              {LANGUAGE_MARKS.map((mark) => (
                <li key={mark.name} aria-label={mark.name} title={mark.name}>
                  <img src={mark.src} alt="" loading="lazy" decoding="async" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section id="real-world" className={styles.realWorld} tabIndex="-1" aria-labelledby="real-world-title">
          <div className={styles.realWorldLead}>
            <div className={styles.realWorldLeadCopy}>
              <div className={styles.realWorldStatement} data-reveal>
                <span className={styles.chapterLabel}>REAL WORLD / 04</span>
                <h2 id="real-world-title">The work moved beyond assignments.<br /><strong>The stakes became real.</strong></h2>
              </div>
              <p className={styles.realWorldCopy} data-reveal>College taught me how to learn and build. Real-world environments added constraints, collaboration, users, reliability, and responsibility.</p>
            </div>
            <div className={styles.realWorldPaper} data-reveal>
              <div className={styles.paperStageRail} aria-hidden="true">
                <span>Interactive builder profile</span>
                <span>Drag + hover</span>
              </div>
              <ThreeDPaper className={styles.realWorldPaperFrame} />
            </div>
          </div>
          <div className={styles.timelineShell} aria-label="Education and professional journey">
            <span className={styles.timelineTrack} aria-hidden="true"><i className={styles.timelineFill} /></span>
            <ol className={styles.timeline}>
              {PROFESSIONAL_CHAPTERS.map((chapter) => (
                <li key={chapter.organization} className={styles.timelineEntry}>
                  <time>{chapter.period}</time>
                  <span className={styles.timelineNode} aria-hidden="true" />
                  <article>
                    <div className={styles.timelineHeading}>
                      <div>
                        <span>{chapter.role}</span>
                        <h3>{chapter.organization}</h3>
                      </div>
                      <small>{chapter.location}</small>
                    </div>
                    <p>{chapter.summary}</p>
                    <ContextChips items={chapter.tags} label={`${chapter.organization} technologies and context`} />
                    {chapter.achievement && <strong className={styles.timelineAchievement}>{chapter.achievement}</strong>}
                  </article>
                </li>
              ))}
            </ol>
          </div>
          <div className={styles.timelineDirection}>
            <span>Current direction</span>
            <p>AI system engineering, scalable platforms, and cloud-based AI deployment.</p>
            <a href="#today">See what I am exploring now <span aria-hidden="true">↓</span></a>
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
          <p data-reveal>That journey now shapes the systems I choose to build.</p>
        </section>

        {galleryOpen && typeof document !== "undefined"
          ? createPortal(<ConvocationGallery items={CONVOCATION_GALLERY} onClose={closeGallery} />, document.body)
          : null}
      </div>
    </InternalPageShell>
  );
}
