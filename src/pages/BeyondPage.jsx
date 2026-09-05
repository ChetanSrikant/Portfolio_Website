import { motion, useReducedMotion } from "framer-motion";
import AetherField from "../components/AetherField.jsx";
import StackingCards, { StackingCardItem } from "../components/ui/StackingCards.jsx";
import { FlowSection } from "../components/ui/StoryScroll.jsx";
import { HorizontalScrollCarousel } from "../components/ui/HorizontalScrollCarousel.jsx";
import InternalPageShell from "../components/InternalPageShell.jsx";
import ChapterIndex from "../components/ui/ChapterIndex.jsx";
import ZoomParallax, { ProgressiveImage } from "../components/ui/ZoomParallax.jsx";
import styles from "./BeyondPage.module.css";

const PARALLAX_IMAGES = [
  {
    src: "/images/beyond/go-kart-trackside-display.webp",
    placeholder: "/images/beyond/go-kart-trackside-lqip.webp",
    alt: "Chetan holding a racing helmet beside a go-kart track",
    caption: "Trackside / helmet down",
    width: 1599,
    height: 899,
    layout: "primary",
  },
  {
    src: "/images/beyond/hyderabad-sunset-display.webp",
    placeholder: "/images/beyond/hyderabad-sunset-lqip.webp",
    alt: "A red sunset over buildings and a road in Hyderabad",
    width: 736,
    height: 981,
    layout: "city",
  },
  {
    src: "/images/beyond/college-friends-display.webp",
    placeholder: "/images/beyond/college-friends-lqip.webp",
    alt: "A group of college friends gathered on outdoor steps",
    width: 1280,
    height: 720,
    layout: "group",
  },
  {
    src: "/images/beyond/ncc-portrait-display.webp",
    placeholder: "/images/beyond/ncc-portrait-lqip.webp",
    alt: "Chetan in an NCC uniform",
    width: 1084,
    height: 1445,
    layout: "ncc",
  },
  {
    src: "/images/beyond/basketball-award-display.webp",
    placeholder: "/images/beyond/basketball-award-lqip.webp",
    alt: "Chetan holding a certificate and trophy after a basketball competition",
    width: 906,
    height: 1599,
    layout: "basketball",
  },
  {
    src: "/images/beyond/diet-coke-wall-display.webp",
    placeholder: "/images/beyond/diet-coke-wall-lqip.webp",
    alt: "A guitar shape assembled from Diet Coke cans above a desk",
    width: 736,
    height: 1308,
    layout: "detail",
  },
];

const ARCHIVE_IMAGES = [
  {
    src: "/images/beyond/motorcycle-street-display.webp",
    placeholder: "/images/beyond/motorcycle-street-lqip.webp",
    alt: "A black motorcycle parked on a sunlit street",
    caption: "Street",
    meta: "Observed along the way",
    width: 1080,
    height: 1920,
    size: "portrait",
  },
  {
    ...PARALLAX_IMAGES[0],
    caption: "Trackside",
    meta: "Play / motion",
    size: "wide",
  },
  {
    ...PARALLAX_IMAGES[2],
    caption: "College",
    meta: "People / archive",
    size: "landscape",
  },
  {
    ...PARALLAX_IMAGES[1],
    caption: "Hyderabad",
    meta: "Place",
    size: "city",
  },
  {
    ...PARALLAX_IMAGES[3],
    caption: "NCC",
    meta: "Archive",
    size: "small",
  },
  {
    ...PARALLAX_IMAGES[4],
    caption: "Basketball",
    meta: "Archive / sport",
    size: "small",
  },
  {
    ...PARALLAX_IMAGES[5],
    caption: "Desk detail",
    meta: "Everyday system",
    size: "detail",
  },
];

// Swap decorative imagery and its desktop/mobile focal points here.
const INTERESTS = [
  {
    number: "01",
    title: "Space",
    copy: "Looking upward has always made everything down here feel a little smaller.",
    background: { src: "/images/beyond/interests/space.svg", position: "68% 50%", mobilePosition: "76% 50%" },
  },
  {
    number: "02",
    title: "Gundam",
    copy: "Machines, engineering, design, and probably more plastic runners than necessary.",
    background: { src: "/images/beyond/interests/mechanical.svg", position: "65% 50%", mobilePosition: "72% 50%" },
  },
  {
    number: "03",
    title: "Stories",
    copy: "Anime, films, games and fictional worlds that refuse to leave my head.",
    background: { src: "/images/beyond/interests/stories.svg", position: "62% 50%", mobilePosition: "68% 50%" },
  },
  {
    number: "04",
    title: "Building",
    copy: "Even away from work, I somehow end up making something.",
    background: { src: "/images/beyond/diet-coke-wall-display.webp", position: "50% 100%", mobilePosition: "30% 94%" },
  },
];

const RIGHT_NOW = [
  {
    category: "Building",
    content: "Small experiments that probably started with “what if...”",
  },
  {
    category: "Learning",
    content: "AI systems, software engineering and whatever rabbit hole came next.",
  },
  {
    category: "Reading",
    content: "Books, articles and ideas worth keeping around.",
  },
  {
    category: "Watching",
    content: "Stories, animation and worlds with ridiculous amounts of detail.",
  },
  {
    category: "Listening",
    content: "Whatever survives the repeat button this month.",
  },
];

const LAST_UPDATED = "2026-09-05";

const CHAPTERS = [
  { id: "field-notes", label: "Opening" },
  { id: "zoom-parallax", label: "Fragments in motion" },
  { id: "interests", label: "Things I keep coming back to" },
  { id: "personal-archive", label: "Personal archive" },
  { id: "right-now", label: "Right now" },
  { id: "micro-detail", label: "Place" },
  { id: "final-statement", label: "Final statement" },
];

function Reveal({ children, className = "", delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();
  const isMasked = className.includes(styles.maskedHeading);

  return (
    <motion.div
      className={`${styles.reveal} ${className}`}
      initial={prefersReducedMotion ? false : {
        opacity: 0,
        y: isMasked ? 28 : 18,
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.06, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: isMasked ? 0.92 : 0.82,
        delay: delay / 1000,
        ease: [0.2, 0.75, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export default function BeyondPage() {
  const updatedLabel = new Date(`${LAST_UPDATED}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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

      <ChapterIndex chapters={CHAPTERS} />

      <div className={styles.editorialBody}>
        <div className={styles.backgroundLayer} aria-hidden="true">
          <AetherField density={1.12} intensity={1} />
        </div>
        <FlowSection id="field-notes" className={`${styles.editorialSection} ${styles.awaySection}`} aria-labelledby="away-title">
          <Reveal className={`${styles.sectionHeading} ${styles.maskedHeading}`}>
            <span className={styles.sectionLabel}>Beyond / 01</span>
            <h2 id="away-title">A life outside the viewport.</h2>
            <p className={styles.openingCopy}>
              <span>Some things I build.</span>
              <span>Some things I collect.</span>
              <span>Some things I simply enjoy.</span>
            </p>
            <p className={styles.openingAside}>The interesting parts rarely fit into a job title.</p>
          </Reveal>
        </FlowSection>

        <ZoomParallax id="zoom-parallax" images={PARALLAX_IMAGES} />

        <FlowSection className={styles.parallaxExit} aria-labelledby="parallax-exit-title">
          <Reveal className={`${styles.parallaxExitInner} ${styles.maskedHeading}`}>
            <h2 id="parallax-exit-title">Different frames.<br />Same person.</h2>
            <p>Work is one part of the picture. The rest keeps it honest.</p>
          </Reveal>
        </FlowSection>

        <section id="interests" className={`${styles.editorialSection} ${styles.interestsSection}`} aria-labelledby="interests-title">
          <Reveal className={`${styles.sectionHeading} ${styles.maskedHeading}`}>
            <span className={styles.sectionLabel}>Beyond / 02</span>
            <h2 id="interests-title">Things I keep coming back to.</h2>
          </Reveal>
          <div className={styles.interestList}>
            {INTERESTS.map((interest, index) => (
              <Reveal key={interest.number} delay={index * 45}>
                <article
                  className={styles.interestRow}
                  style={{
                    "--interest-position": interest.background.position,
                    "--interest-mobile-position": interest.background.mobilePosition,
                  }}
                >
                  <img
                    className={styles.interestBackground}
                    src={interest.background.src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                  <span className={styles.interestNumber}>{interest.number}</span>
                  <h3>{interest.title}</h3>
                  <p>{interest.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="personal-archive" className={`${styles.editorialSection} ${styles.archiveSection}`} aria-labelledby="archive-title">
          <Reveal className={`${styles.sectionHeading} ${styles.maskedHeading}`}>
            <span className={styles.sectionLabel}>Beyond / 03</span>
            <h2 id="archive-title">Personal archive.</h2>
            <p className={styles.archiveIntro}>A few frames that stayed.</p>
          </Reveal>
          <HorizontalScrollCarousel images={ARCHIVE_IMAGES} />
        </section>

        <section id="right-now" className={`${styles.editorialSection} ${styles.nowSection}`} aria-labelledby="now-title">
          <Reveal className={`${styles.sectionHeading} ${styles.maskedHeading}`}>
            <span className={styles.sectionLabel}>Beyond / 04</span>
            <h2 id="now-title">Right now.</h2>
            <span className={styles.updated}>Updated / {updatedLabel}</span>
          </Reveal>
          <StackingCards totalCards={RIGHT_NOW.length} className={styles.nowList}>
            {RIGHT_NOW.map((item, index) => (
              <StackingCardItem key={item.category} index={index}>
                <dl className={styles.nowRow}>
                  <dt>{item.category}</dt>
                  <dd>{item.content}</dd>
                </dl>
              </StackingCardItem>
            ))}
          </StackingCards>
        </section>

        <section id="micro-detail" className={styles.microDetail} aria-label="A small frame from Hyderabad">
          <ProgressiveImage
            className={styles.microDetailImage}
            src="/images/beyond/hyderabad-bridge.png"
            alt="Sunset behind a cable-stayed bridge in Hyderabad, reflected in the water"
            width="1200"
            height="1600"
          />
          <span>Hyderabad / place</span>
        </section>

        <FlowSection id="final-statement" className={styles.finalStatement} aria-labelledby="final-statement-title">
          <Reveal className={`${styles.finalStatementInner} ${styles.maskedHeading}`}>
            <span className={styles.finalMarker} aria-hidden="true" />
            <h2 id="final-statement-title">Not everything I care about <br />needs to become a project.</h2>
            <p>And that&apos;s probably the point.</p>
          </Reveal>
        </FlowSection>
      </div>
    </InternalPageShell>
  );
}
