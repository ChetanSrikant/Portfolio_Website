import { useEffect, useRef } from "react";
import Nav from "../components/Nav.jsx";
import Hero from "../components/Hero.jsx";
import FloatingDock from "../components/FloatingDock.jsx";
import GundamStage from "../components/GundamStage.jsx";
import HomeCompletionSections from "../components/HomeCompletionSections.jsx";
import Footer from "../components/Footer.jsx";
import useHeroNavigationMode from "../hooks/useHeroNavigationMode.js";

export default function HomePage() {
  const gundamApiRef = useRef(null);
  const navigationCondensed = useHeroNavigationMode();

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
      <Nav visible={!navigationCondensed} />
      <FloatingDock visible />
      <main id="main-content">
        <Hero />
        <GundamStage gundamApiRef={gundamApiRef}>
          <HomeCompletionSections />
        </GundamStage>
      </main>
      <Footer />
    </>
  );
}
