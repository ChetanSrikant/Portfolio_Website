import React, { useRef } from "react";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import FloatingDock from "./components/FloatingDock.jsx";
import GundamStage from "./components/GundamStage.jsx";
import HomeCompletionSections from "./components/HomeCompletionSections.jsx";
import Footer from "./components/Footer.jsx";
import useHeroNavigationMode from "./hooks/useHeroNavigationMode.js";

export default function App() {
  // Shared imperative handle onto the live Gundam instance — Playground
  // buttons and the model's own click/dblclick handlers both drive it.
  const gundamApiRef = useRef(null);
  const navigationCondensed = useHeroNavigationMode();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Nav visible={!navigationCondensed} />
      <FloatingDock visible={navigationCondensed} />
      <main id="main-content">
        <Hero />
        <GundamStage gundamApiRef={gundamApiRef} />
        <HomeCompletionSections />
      </main>
      <Footer />
    </>
  );
}
