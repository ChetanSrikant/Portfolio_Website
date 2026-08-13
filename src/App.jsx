import React, { useEffect, useRef } from "react";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import FloatingDock from "./components/FloatingDock.jsx";
import GundamStage from "./components/GundamStage.jsx";
import HomeCompletionSections from "./components/HomeCompletionSections.jsx";
import Footer from "./components/Footer.jsx";
import useHeroNavigationMode from "./hooks/useHeroNavigationMode.js";
import AboutPage from "./pages/AboutPage.jsx";
import WorkPage from "./pages/WorkPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import BeyondPage from "./pages/BeyondPage.jsx";
import { CredentialsPage, NotFoundPage } from "./pages/RouteStatusPage.jsx";

function HomePage() {
  // Shared imperative handle onto the live Gundam instance — Playground
  // buttons and the model's own click/dblclick handlers both drive it.
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
      <FloatingDock visible={navigationCondensed} />
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

const PAGE_ROUTES = {
  "/about": AboutPage,
  "/work": WorkPage,
  "/projects": ProjectsPage,
  "/beyond": BeyondPage,
  "/credentials": CredentialsPage,
};

export default function App() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const Page = PAGE_ROUTES[path];

  if (Page) return <Page />;
  if (path === "/") return <HomePage />;
  return <NotFoundPage />;
}
