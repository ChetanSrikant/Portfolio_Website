import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, PerspectiveCamera } from "@react-three/drei";
import GundamModel, { CLIPS } from "./GundamModel.jsx";
import useScrollProgress, { mapRange } from "../hooks/useScrollProgress.js";
import {
  getGundamTransform,
  getHomeStageIndex,
  HOME_CHOREOGRAPHY,
  HOME_STAGE,
  HOME_STAGE_KEYS,
  HOME_STAGES,
} from "../config/home.js";
import PlaygroundContent from "./Playground.jsx";
import styles from "./GundamStage.module.css";

function panelOpacity(progress, [start, visibleStart, visibleEnd, end]) {
  if (progress <= start || progress >= end) return 0;
  if (progress < visibleStart) {
    return mapRange(progress, start, visibleStart, 0, 1);
  }
  if (progress < visibleEnd) return 1;
  return mapRange(progress, visibleEnd, end, 1, 0);
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  return reducedMotion;
}

function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth
  );

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return viewportWidth;
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

function crossedFlightBoundary(previousIndex, currentIndex) {
  if (previousIndex === currentIndex) return false;

  const direction = currentIndex > previousIndex ? 1 : -1;
  return HOME_CHOREOGRAPHY.flightBoundaryIndexes.some((boundaryIndex) =>
    direction > 0
      ? boundaryIndex > previousIndex && boundaryIndex <= currentIndex
      : boundaryIndex <= previousIndex && boundaryIndex > currentIndex
  );
}

export default function GundamStage({ gundamApiRef, children }) {
  const wrapperRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const viewportWidth = useViewportWidth();
  const [modelReady, setModelReady] = useState(false);
  const choreography = useRef({
    initialized: false,
    stageIndex: 0,
    previousProgress: 0,
    direction: 1,
    lastFlightAt: -Infinity,
    introSequencePlayed: false,
  });
  const progress = useScrollProgress(wrapperRef);
  const currentStageIndex = getHomeStageIndex(
    progress,
    choreography.current.initialized ? choreography.current.stageIndex : null
  );
  const currentStage = HOME_STAGES[currentStageIndex];
  const transform = useMemo(
    () => getGundamTransform(progress, { reducedMotion, viewportWidth }),
    [progress, reducedMotion, viewportWidth]
  );

  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  useEffect(() => {
    const state = choreography.current;
    const introVisibleAt = HOME_STAGE.panelFades.intro[1];
    if (!modelReady || state.introSequencePlayed) return;
    if (currentStage.key !== HOME_STAGE_KEYS.INTRO) return;
    if (progress < introVisibleAt) return;

    state.introSequencePlayed = true;
    if (reducedMotion) return;

    gundamApiRef.current?.playSequence([CLIPS.SABER, CLIPS.RIFLE]);
  }, [currentStage.key, gundamApiRef, modelReady, progress, reducedMotion]);

  useEffect(() => {
    const state = choreography.current;

    if (!state.initialized) {
      state.initialized = true;
      state.stageIndex = currentStageIndex;
      state.previousProgress = progress;
      return;
    }

    const direction = progress >= state.previousProgress ? 1 : -1;
    const changedStage = currentStageIndex !== state.stageIndex;

    if (changedStage) {
      const now = performance.now();
      const shouldFly = crossedFlightBoundary(
        state.stageIndex,
        currentStageIndex
      );

      if (
        shouldFly &&
        !reducedMotion &&
        now - state.lastFlightAt >= HOME_CHOREOGRAPHY.flightCooldownMs
      ) {
        gundamApiRef.current?.play(CLIPS.LIFTER);
        state.lastFlightAt = now;
      }

      state.stageIndex = currentStageIndex;
      state.direction = direction;
    }

    state.previousProgress = progress;
  }, [currentStageIndex, gundamApiRef, progress, reducedMotion]);

  const introOpacity = panelOpacity(progress, HOME_STAGE.panelFades.intro);
  const philosophyOpacity = panelOpacity(
    progress,
    HOME_STAGE.panelFades.philosophy
  );
  const playgroundOpacity = panelOpacity(
    progress,
    HOME_STAGE.panelFades.playground
  );
  const playgroundActive =
    currentStage.key === HOME_STAGE_KEYS.PLAYGROUND &&
    playgroundOpacity > 0.4;

  const rotationDeg = Math.round(
    ((-transform.rotationY * 180) / Math.PI) % 360
  );

  return (
    <section
      id="gundam-wrapper"
      ref={wrapperRef}
      className={styles.wrapper}
      data-gundam-stage={currentStage.key}
      data-gundam-direction={
        choreography.current.direction > 0 ? "forward" : "reverse"
      }
      aria-label="Interactive Gundam portfolio experience"
    >
      <div className={styles.sticky}>
        <div
          className={styles.canvasLayer}
          style={{
            opacity: transform.opacity,
            pointerEvents: playgroundActive ? "auto" : "none",
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
                targetPosition={[transform.x, transform.y, transform.z]}
                targetScale={transform.scale}
                interactive={playgroundActive}
                onReady={handleModelReady}
                onSingleClick={() => gundamApiRef.current?.play(CLIPS.SABER)}
                onDoubleClick={() => gundamApiRef.current?.play(CLIPS.SHIELD)}
              />
              <ContactShadows
                position={[0, 0.01, 0]}
                opacity={transform.shadowOpacity}
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
          <span className={styles.stage}>{currentStage.label}</span>
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
          data-gundam-panel="intro"
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
          data-gundam-panel="philosophy"
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
          className={`${styles.panel} ${styles.panelSplit} ${styles.panelPlayground}`}
          data-gundam-panel="playground"
          style={{
            opacity: playgroundOpacity,
            pointerEvents: "none",
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
        <div
          id="final-playground"
          className={styles.landingSpacer}
          data-gundam-stage-anchor="playground"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
