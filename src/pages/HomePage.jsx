import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import Nav from "../components/Nav.jsx";
import Hero from "../components/Hero.jsx";
import FloatingDock from "../components/FloatingDock.jsx";
import HomeCompletionSections from "../components/HomeCompletionSections.jsx";
import Footer from "../components/Footer.jsx";
import GundamEngineeringNote from "../components/GundamEngineeringNote.jsx";
import styles from "./HomePage.module.css";
import stageStyles from "../components/GundamStage.module.css";

const GundamStage = lazy(() => import("../components/GundamStage.jsx"));

class StageBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <StageLoader failed /> : this.props.children; }
}

function StageLoader({ failed = false }) {
  return (
    <section
      id="gundam-wrapper"
      aria-label="Interactive Gundam portfolio experience"
      aria-busy={!failed}
      className={failed ? undefined : stageStyles.wrapper}
    >
      {failed ? <p role="status">The 3D model could not load. The work below is still available. <a href="/">Reload to try again</a>.</p> : <span className={styles.srOnly} role="status">Loading interactive portfolio experience</span>}
      {!failed && <div className={stageStyles.sticky} aria-hidden="true" />}
      <div className={stageStyles.journeyContent}>
        {!failed && <div className={stageStyles.leadSpacer} aria-hidden="true" />}
        <div className={stageStyles.editorialLayer}><HomeCompletionSections /></div>
        <div id="final-playground" className={failed ? undefined : stageStyles.landingSpacer} data-gundam-stage-anchor="playground" aria-hidden={!failed}>{failed && <p>The playground is unavailable while the model cannot load. <a href="/work">Explore the case studies</a>.</p>}</div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const gundamApiRef = useRef(null);
  const boundaryRef = useRef(null);
  const [loadStage, setLoadStage] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadStage(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -120px 0px" });
    observer.observe(boundaryRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (!hash) return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Nav hideOnScroll />
      <FloatingDock visible />
      <main id="main-content">
        <Hero />
        <div ref={boundaryRef}>
          <StageBoundary>
          <Suspense fallback={<StageLoader />}>
            {loadStage ? (
              <GundamStage gundamApiRef={gundamApiRef}>
                <HomeCompletionSections />
              </GundamStage>
            ) : <StageLoader />}
          </Suspense>
          </StageBoundary>
        </div>
        <GundamEngineeringNote />
      </main>
      <Footer />
    </>
  );
}
