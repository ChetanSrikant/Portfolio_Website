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
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GundamModel, { CLIPS } from "./GundamModel.jsx";
import useScrollProgress, { mapRange } from "../hooks/useScrollProgress.js";
import {
  getGundamTransform,
  getIntroToPhilosophyTransform,
  getIntroToPhilosophyPathPoints,
  getHomeStageIndex,
  HOME_CHOREOGRAPHY,
  HOME_STAGE,
  HOME_STAGE_KEYS,
  HOME_STAGES,
} from "../config/home.js";
import PlaygroundContent from "./Playground.jsx";
import DriftWall from "./DriftWall.jsx";
import DecryptedText from "./DecryptedText.jsx";
import styles from "./GundamStage.module.css";

gsap.registerPlugin(ScrollTrigger);

const DRIFT_WALL_ITEMS = [
  { image: "/images/drift-wall/drift-01.jpeg", focalPoint: "50% 30%" },
  { image: "/images/drift-wall/drift-02.jpeg", focalPoint: "50% 38%" },
  { image: "/images/drift-wall/drift-03.jpeg", focalPoint: "50% 14%" },
  { image: "/images/drift-wall/drift-04.jpeg", focalPoint: "50% 54%" },
  { image: "/images/drift-wall/drift-05.jpeg", focalPoint: "50% 15%" },
  { image: "/images/drift-wall/drift-06.jpeg", focalPoint: "50% 62%" },
  { image: "/images/drift-wall/drift-07.jpeg", focalPoint: "50% 59%" },
  { image: "/images/drift-wall/drift-08.jpeg", focalPoint: "50% 57%" },
  { image: "/images/drift-wall/drift-09.jpeg", focalPoint: "50% 50%" },
  { image: "/images/drift-wall/drift-10.jpeg", focalPoint: "50% 57%" },
];

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

function TransitionPathDebug({ viewportWidth }) {
  const geometry = useMemo(() => {
    const points = getIntroToPhilosophyPathPoints(viewportWidth, 80);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [viewportWidth]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <line
      geometry={geometry}
      visible={
        import.meta.env.DEV &&
        import.meta.env.VITE_DEBUG_GUNDAM_PATH === "true"
      }
    >
      <lineBasicMaterial color="#c9a24b" transparent opacity={0.72} />
    </line>
  );
}

export default function GundamStage({ gundamApiRef, children }) {
  const wrapperRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const viewportWidth = useViewportWidth();
  const [modelReady, setModelReady] = useState(false);
  const [introToPhilosophyProgress, setIntroToPhilosophyProgress] = useState(0);
  const transitionProgressRef = useRef(0);
  const choreography = useRef({
    initialized: false,
    stageIndex: 0,
    previousProgress: 0,
    direction: 1,
    introSequencePlayed: false,
  });
  const progress = useScrollProgress(wrapperRef);
  const currentStageIndex = getHomeStageIndex(
    progress,
    choreography.current.initialized ? choreography.current.stageIndex : null
  );
  const currentStage = HOME_STAGES[currentStageIndex];
  const transitionRange = HOME_CHOREOGRAPHY.introToPhilosophy;
  const transitionOwnsTransform =
    !reducedMotion &&
    progress >= transitionRange.start &&
    (introToPhilosophyProgress < 0.999 ||
      currentStage.key === HOME_STAGE_KEYS.PHILOSOPHY);
  const transitionInFlight =
    !reducedMotion &&
    progress >= transitionRange.start &&
    introToPhilosophyProgress > 0.001 &&
    introToPhilosophyProgress < 0.999;
  const transform = useMemo(() => {
    if (transitionOwnsTransform) {
      return getIntroToPhilosophyTransform(introToPhilosophyProgress, {
        reducedMotion,
        viewportWidth,
      });
    }

    return getGundamTransform(progress, { reducedMotion, viewportWidth });
  }, [
    introToPhilosophyProgress,
    progress,
    reducedMotion,
    transitionOwnsTransform,
    viewportWidth,
  ]);

  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    const philosophySection = wrapper.querySelector(
      transitionRange.landingSelector
    );
    if (!philosophySection) return undefined;

    const context = gsap.context(() => {
      const transition = { progress: 0 };
      const updateProgress = (value) => {
        const travelRange = 1 - transitionRange.landingHold;
        const scrubbedProgress = value >= travelRange ? 1 : value / travelRange;
        const next = Math.min(1, Math.max(0, scrubbedProgress));
        if (Math.abs(next - transitionProgressRef.current) < 0.0005) return;
        transitionProgressRef.current = next;
        setIntroToPhilosophyProgress(next);
      };
      const scrollPositionFor = (fraction) => {
        const scrollableDistance = wrapper.offsetHeight - window.innerHeight;
        return wrapper.offsetTop + scrollableDistance * fraction;
      };

      gsap.to(transition, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          id: "intro-to-philosophy-lifter-scrub",
          trigger: wrapper,
          start: () => scrollPositionFor(transitionRange.start),
          endTrigger: philosophySection,
          end: "center center",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateProgress(self.progress),
          onRefresh: (self) => updateProgress(self.progress),
        },
      });
    }, wrapper);

    return () => context.revert();
  }, [transitionRange.landingHold, transitionRange.start]);

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
      state.stageIndex = currentStageIndex;
      state.direction = direction;
    }

    state.previousProgress = progress;
  }, [currentStageIndex, progress]);

  const introOpacity = panelOpacity(progress, HOME_STAGE.panelFades.intro);
  const skillsBackdropOpacity = panelOpacity(
    progress,
    HOME_STAGE.panelFades.skillsBackdrop
  );
  const playgroundOpacity = panelOpacity(
    progress,
    HOME_STAGE.panelFades.playground
  );
  const playgroundActive =
    currentStage.key === HOME_STAGE_KEYS.PLAYGROUND &&
    playgroundOpacity > 0.4;
  const basicInteractionActive =
    !transitionInFlight &&
    ((currentStage.key === HOME_STAGE_KEYS.INTRO && introOpacity > 0.4) ||
    (currentStage.key === HOME_STAGE_KEYS.PHILOSOPHY &&
      introToPhilosophyProgress >= 0.999));
  const philosophyLanded =
    currentStage.key === HOME_STAGE_KEYS.PHILOSOPHY &&
    introToPhilosophyProgress >= 0.999;

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
        <DriftWall
          items={DRIFT_WALL_ITEMS}
          columns={5}
          tileWidth={200}
          tileHeight={132}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.55}
          overlayColor="#060010"
          active={skillsBackdropOpacity > 0.02}
          opacity={skillsBackdropOpacity}
        />
        {skillsBackdropOpacity > 0.18 && (
          <div
            className={styles.skillsBackdropCaption}
            style={{ opacity: skillsBackdropOpacity }}
          >
            <span className={styles.skillsBackdropMeta}>PERSONAL ARCHIVE / 10 FRAMES</span>
            <DecryptedText
              text="NOT EVERYTHING I BUILD LIVES IN CODE."
              speed={42}
              maxIterations={18}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>"
              animateOn="view"
              revealDirection="center"
              className={styles.decryptedRevealed}
              parentClassName={styles.decryptedText}
              encryptedClassName={styles.decryptedEncrypted}
            />
          </div>
        )}
        <div
          className={styles.canvasLayer}
          style={{
            opacity: transform.opacity,
            pointerEvents:
              playgroundActive || basicInteractionActive ? "auto" : "none",
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
                targetRotationZ={transform.rotationZ || 0}
                targetPosition={[transform.x, transform.y, transform.z]}
                targetScale={transform.scale}
                interactive={playgroundActive}
                basicInteractive={basicInteractionActive}
                scrubbedLifterProgress={introToPhilosophyProgress}
                scrubbedLifterActive={transitionInFlight}
                reducedMotion={reducedMotion}
                onReady={handleModelReady}
                onSingleClick={() => {
                  if (currentStage.key === HOME_STAGE_KEYS.INTRO) {
                    gundamApiRef.current?.playSequence([
                      CLIPS.SABER,
                      CLIPS.SABER,
                    ]);
                    return;
                  }

                  gundamApiRef.current?.play(CLIPS.SABER);
                }}
                onDoubleClick={() => gundamApiRef.current?.play(CLIPS.SHIELD)}
              />
              <TransitionPathDebug viewportWidth={viewportWidth} />
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
          {philosophyLanded && (
            <>
              <br />
              <span className={styles.landedStatus}>LIFTER / LANDED</span>
            </>
          )}
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
