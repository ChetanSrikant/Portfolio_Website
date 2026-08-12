import React, { useRef } from "react";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import GundamStage from "./components/GundamStage.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  // Shared imperative handle onto the live Gundam instance — Playground
  // buttons and the model's own click/dblclick handlers both drive it.
  const gundamApiRef = useRef(null);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <GundamStage gundamApiRef={gundamApiRef} />
      </main>
      <Footer />
    </>
  );
}
