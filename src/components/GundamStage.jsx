import React, { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import GundamModel from "./GundamModel.jsx";
import useScrollProgress, { mapRange } from "../hooks/useScrollProgress.js";
import PlaygroundContent from "./Playground.jsx";
import CTADockContent from "./CTADock.jsx";
import styles from "./GundamStage.module.css";

const WRAPPER_HEIGHT_VH = 480;

// Narrative breakpoints along overall scroll progress (0 → 1). Each is
// [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd] and — deliberately —
// none of these ranges overlap a neighbor's, so two text panels are never
// both partially visible at once.
const RANGES = {
  intro: [0.0, 0.03, 0.15, 0.19],
  quote: [0.19, 0.23, 0.37, 0.41],
  playground: [0.41, 0.45, 0.72, 0.76],
};

function panelOpacity(p, [a, b, c, d]) {
  if (p <= a || p >= d) return 0;
  if (p < b) return mapRange(p, a, b, 0, 1);
  if (p < c) return 1;
  return mapRange(p, c, d, 1, 0);
}

function ctaOpacity(p) {
  if (p <= 0.82) return 0;
  if (p < 0.86) return mapRange(p, 0.82, 0.86, 0, 1);
  return 1;
}

function computeGundamTransform(p) {
  let x;
  if (p < 0.08) x = mapRange(p, 0, 0.08, -5.5, -1.8);
  else if (p < 0.41) x = -1.8;
  else if (p < 0.45) x = mapRange(p, 0.41, 0.45, -1.8, 0);
  else if (p < 0.74) x = 0;
  else if (p < 0.82) x = mapRange(p, 0.74, 0.82, 0, -2.4);
  else x = -2.4;

  let scale;
  if (p < 0.08) scale = mapRange(p, 0, 0.08, 0.82, 1);
  else if (p < 0.74) scale = 1;
  else if (p < 0.82) scale = mapRange(p, 0.74, 0.82, 1, 0.82);
  else scale = 0.82;

  // A full spin would swing the wide backpack fins toward the camera at
  // some angles, foreshortening into an oversized close-up. Keep the turn
  // to a cinematic ~80° max.
  const rotationY = -p * Math.PI * 0.46;

  return { x, scale, rotationY };
}

function stageLabel(p) {
  if (p < 0.19) return "INTRO";
  if (p < 0.41) return "PHILOSOPHY";
  if (p < 0.82) return "PLAYGROUND";
  return "CONTACT";
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#3a3a42", "#0a0a0a", 0.4]} />
      {/* Key light — warm, slightly gold */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.6}
        color="#fff3dd"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Rim light — accent gold, from behind for silhouette edge glow */}
      <directionalLight position={[-3, 3, -5]} intensity={1.8} color="#c9a24b" />
      {/* Cool fill from the opposite side */}
      <directionalLight position={[-5, 2, 3]} intensity={0.4} color="#6b7a8f" />
    </>
  );
}

export default function GundamStage({ gundamApiRef }) {
  const wrapperRef = useRef(null);
  const progress = useScrollProgress(wrapperRef);

  const transform = useMemo(() => computeGundamTransform(progress), [progress]);
  const introOp = panelOpacity(progress, RANGES.intro);
  const quoteOp = panelOpacity(progress, RANGES.quote);
  const playgroundOp = panelOpacity(progress, RANGES.playground);
  const ctaOp = ctaOpacity(progress);

  const rotationDeg = Math.round(
    ((-transform.rotationY * 180) / Math.PI) % 360
  );

  return (
    <div
      id="gundam-wrapper"
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ height: `${WRAPPER_HEIGHT_VH}vh` }}
    >
      <div className={styles.sticky}>
        <div className={styles.canvasLayer}>
          <Canvas shadows dpr={[1, 1.8]}>
            <PerspectiveCamera makeDefault position={[0, 1.75, 7.6]} fov={36} />
            <Lighting />
            <GundamModel
              ref={gundamApiRef}
              targetRotationY={transform.rotationY}
              targetPosition={[transform.x, 0, 0]}
              targetScale={transform.scale}
              onSingleClick={() => gundamApiRef.current?.play("01-SABER")}
              onDoubleClick={() => gundamApiRef.current?.play("03-SHILD")}
            />
            <ContactShadows
              position={[0, 0.01, 0]}
              opacity={0.55}
              scale={12}
              blur={2.4}
              far={4}
              color="#000000"
            />
          </Canvas>
        </div>

        <div className={styles.vignette} />

        {/* HUD */}
        <div className={`${styles.hud} ${styles.hudTopRight}`}>
          <span className={styles.stage}>{stageLabel(progress)}</span>
          <br />
          UNIT — ZGMF-X09A
          <br />
          HEADING — {rotationDeg}°
        </div>
        <div className={`${styles.hud} ${styles.hudBottomBar}`}>
          <div
            className={styles.hudBottomBarFill}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>

        {/* Intro panel */}
        <div
          className={`${styles.panel} ${styles.panelRight}`}
          style={{ opacity: introOp }}
        >
          <div className={styles.introBlock}>
            <span className="eyebrow">Say hello</span>
            <h2 className={styles.introHeadline} style={{ marginTop: 14 }}>
              Meet the machine that <span className="accent">runs this portfolio.</span>
            </h2>
          </div>
        </div>

        {/* Quote panel */}
        <div
          className={`${styles.panel} ${styles.panelRight}`}
          style={{ opacity: quoteOp }}
        >
          <div className={styles.quoteBlock}>
            <span className={`eyebrow ${styles.quoteLabel}`}>// philosophy.md</span>
            <p className={styles.quoteLine}>
              I build software the way this thing was built to fight —
              every system engineered to move, adapt, and hold under
              pressure. AI does the heavy lifting; judgment decides where
              it points.
            </p>
          </div>
        </div>

        {/* Playground panel */}
        <div
          className={`${styles.panel} ${styles.panelCenterBottom}`}
          style={{
            opacity: playgroundOp,
            pointerEvents: playgroundOp > 0.4 ? "auto" : "none",
          }}
        >
          <PlaygroundContent gundamApiRef={gundamApiRef} active={playgroundOp > 0.4} />
        </div>

        {/* CTA dock panel */}
        <div
          className={`${styles.panel} ${styles.panelCenterBottom}`}
          style={{ opacity: ctaOp, pointerEvents: ctaOp > 0.4 ? "auto" : "none" }}
        >
          <CTADockContent />
        </div>
      </div>
    </div>
  );
}
