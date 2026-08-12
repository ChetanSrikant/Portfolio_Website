import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, PerspectiveCamera } from "@react-three/drei";
import GundamModel, { CLIPS } from "./GundamModel.jsx";
import useScrollProgress, { mapRange } from "../hooks/useScrollProgress.js";
import {
  getGundamTransform,
  getStageLabel,
  HOME_STAGE,
} from "../config/home.js";
import PlaygroundContent from "./Playground.jsx";
import CTADockContent from "./CTADock.jsx";
import styles from "./GundamStage.module.css";

function panelOpacity(p, [a, b, c, d]) {
  if (p <= a || p >= d) return 0;
  if (p < b) return mapRange(p, a, b, 0, 1);
  if (p < c) return 1;
  return mapRange(p, c, d, 1, 0);
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#3a3a42", "#0a0a0a", 0.4]} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.6}
        color="#fff3dd"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 3, -5]} intensity={1.8} color="#c9a24b" />
      <directionalLight position={[-5, 2, 3]} intensity={0.4} color="#6b7a8f" />
    </>
  );
}

function ModelLoading() {
  return (
    <Html center>
      <div className={styles.modelLoading} role="status">
        <span />
        Initializing unit
      </div>
    </Html>
  );
}

export default function GundamStage({ gundamApiRef, children }) {
  const wrapperRef = useRef(null);
  const latestProgress = useRef(0);
  const choreography = useRef({
    boomerang: false,
    lifter: false,
    rifle: false,
    landing: false,
    rifleTimer: null,
    landingTimer: null,
  });
  const progress = useScrollProgress(wrapperRef);
  const transform = useMemo(() => getGundamTransform(progress), [progress]);

  latestProgress.current = progress;

  useEffect(() => {
    const state = choreography.current;
    const model = gundamApiRef.current;
    if (!model) return undefined;

    if (progress >= 0.055 && progress < 0.1 && !state.boomerang) {
      state.boomerang = true;
      model.play(CLIPS.BOOMERANG);
    }

    if (progress >= 0.1 && progress < 0.21 && !state.lifter) {
      state.lifter = true;
      model.play(CLIPS.LIFTER);
      state.rifleTimer = window.setTimeout(() => {
        const current = latestProgress.current;
        if (current >= 0.1 && current < 0.21 && !state.rifle) {
          state.rifle = true;
          gundamApiRef.current?.play(CLIPS.RIFLE);
        }
        state.rifleTimer = null;
      }, 900);
    }

    if (progress >= 0.21 && state.rifleTimer) {
      window.clearTimeout(state.rifleTimer);
      state.rifleTimer = null;
    }

    if (progress >= 0.89 && progress < 0.985 && !state.landing) {
      state.landing = true;
      model.play(CLIPS.LIFTER);
      state.landingTimer = window.setTimeout(() => {
        if (latestProgress.current >= 0.91) {
          gundamApiRef.current?.playIdle();
        }
        state.landingTimer = null;
      }, 1250);
    }

    return undefined;
  }, [gundamApiRef, progress]);

  useEffect(() => {
    const state = choreography.current;
    return () => {
      if (state.rifleTimer) window.clearTimeout(state.rifleTimer);
      if (state.landingTimer) window.clearTimeout(state.landingTimer);
    };
  }, []);

  const introOpacity = panelOpacity(progress, HOME_STAGE.panelFades.intro);
  const philosophyOpacity = panelOpacity(
    progress,
    HOME_STAGE.panelFades.philosophy
  );
  const playgroundOpacity = panelOpacity(
    progress,
    HOME_STAGE.panelFades.playground
  );
  const contactOpacity = panelOpacity(progress, HOME_STAGE.panelFades.contact);
  const playgroundActive = playgroundOpacity > 0.4;
  let modelOpacity = 1;
  if (progress >= 0.2 && progress < 0.25) {
    modelOpacity = mapRange(progress, 0.2, 0.25, 1, 0.32);
  } else if (progress >= 0.25 && progress < 0.89) {
    modelOpacity = 0.32;
  } else if (progress >= 0.89 && progress < 0.94) {
    modelOpacity = mapRange(progress, 0.89, 0.94, 0.32, 1);
  }

  const rotationDeg = Math.round(
    ((-transform.rotationY * 180) / Math.PI) % 360
  );

  return (
    <section
      id="gundam-wrapper"
      ref={wrapperRef}
      className={styles.wrapper}
      aria-label="Interactive Gundam portfolio experience"
    >
      <div className={styles.sticky}>
        <div
          className={styles.canvasLayer}
          style={{
            opacity: modelOpacity,
            pointerEvents: modelOpacity > 0.08 ? "auto" : "none",
          }}
          aria-hidden="true"
        >
          <Canvas
            shadows
            dpr={[1, 1.8]}
            fallback={
              <div className={styles.webglFallback} role="status">
                The 3D unit is unavailable, but the portfolio remains accessible.
              </div>
            }
          >
            <PerspectiveCamera makeDefault position={[0, 1.75, 7.6]} fov={36} />
            <Lighting />
            <Suspense fallback={<ModelLoading />}>
              <GundamModel
                ref={gundamApiRef}
                targetRotationY={transform.rotationY}
                targetPosition={[transform.x, 0, 0]}
                targetScale={transform.scale}
                onSingleClick={() => gundamApiRef.current?.play(CLIPS.SABER)}
                onDoubleClick={() => gundamApiRef.current?.play(CLIPS.SHIELD)}
              />
              <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.55}
                scale={12}
                blur={2.4}
                far={4}
                color="#000000"
              />
            </Suspense>
          </Canvas>
        </div>

        <div className={styles.vignette} aria-hidden="true" />

        <div className={`${styles.hud} ${styles.hudTopRight}`} aria-hidden="true">
          <span className={styles.stage}>{getStageLabel(progress)}</span>
          <br />
          UNIT / ZGMF-X09A
          <br />
          HEADING / {rotationDeg}°
        </div>
        <div className={`${styles.hud} ${styles.hudBottomBar}`} aria-hidden="true">
          <div
            className={styles.hudBottomBarFill}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>

        <div
          className={`${styles.panel} ${styles.panelSplit} ${styles.panelIntro}`}
          style={{ opacity: introOpacity }}
          aria-hidden={introOpacity < 0.5}
        >
          <div className={styles.introBlock}>
            <span className="eyebrow">ZGMF-X09A / online</span>
            <h2 className={styles.introHeadline}>
              Meet the machine that <span className={styles.accent}>runs this portfolio.</span>
            </h2>
            <p className={styles.introCopy}>
              One rig, seven authored movements, and a scroll-linked mission path.
            </p>
          </div>
        </div>

        <div
          className={`${styles.panel} ${styles.panelSplit} ${styles.panelPhilosophy}`}
          style={{ opacity: philosophyOpacity }}
          aria-hidden={philosophyOpacity < 0.5}
        >
          <div className={styles.quoteBlock}>
            <span className={`eyebrow ${styles.quoteLabel}`}>// philosophy.md</span>
            <p className={styles.quoteLine}>
              Build systems that move with intent, adapt under pressure, and
              stay understandable when complexity rises. AI supplies leverage.
              Judgment gives it direction.
            </p>
          </div>
        </div>

        <div
          className={`${styles.panel} ${styles.panelCenterBottom}`}
          style={{
            opacity: contactOpacity,
            pointerEvents: contactOpacity > 0.4 ? "auto" : "none",
          }}
          aria-hidden={contactOpacity < 0.4}
        >
          <CTADockContent />
        </div>

        <div
          className={`${styles.panel} ${styles.panelSplit} ${styles.panelPlayground}`}
          style={{
            opacity: playgroundOpacity,
            pointerEvents: playgroundActive ? "auto" : "none",
          }}
          aria-hidden={!playgroundActive}
        >
          <PlaygroundContent
            gundamApiRef={gundamApiRef}
            active={playgroundActive}
          />
        </div>
      </div>

      <div className={styles.journeyContent}>
        <div className={styles.leadSpacer} aria-hidden="true" />
        <div className={styles.editorialLayer}>{children}</div>
        <div id="final-playground" className={styles.landingSpacer} aria-hidden="true" />
      </div>
    </section>
  );
}
