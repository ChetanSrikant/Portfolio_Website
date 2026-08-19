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
  HOME_TARGETS,
} from "../config/home.js";
import PlaygroundContent from "./Playground.jsx";
import DriftWall from "./DriftWall.jsx";
import DecryptedText from "./DecryptedText.jsx";
import styles from "./GundamStage.module.css";
import KineticTextLoader from "./KineticTextLoader.jsx";

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
  { image: "/images/drift-wall/drift-11.jpeg", focalPoint: "50% 38%" },
  { image: "/images/drift-wall/drift-12.jpeg", focalPoint: "48% 43%" },
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
      <div className={styles.modelLoading}><KineticTextLoader text="INITIALIZING UNIT" accessibleLabel="Initializing Gundam model" /></div>
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
  const canvasLayerRef = useRef(null);
  const initializationRef = useRef(null);
  const introPanelRef = useRef(null);
  const playgroundPanelRef = useRef(null);
  const driftWallRef = useRef(null);
  const skillsCaptionRef = useRef(null);
  const progressFillRef = useRef(null);
  const headingRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const viewportWidth = useViewportWidth();
  const [modelReady, setModelReady] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const initializationCompleteRef = useRef(false);
  const revealRunningRef = useRef(false);
  const transitionProgressRef = useRef(0);
  const motionRef = useRef({
    rotationY: 0,
    rotationZ: 0,
    position: [0, 0, 0],
    scale: 1,
    lifterActive: false,
    lifterProgress: 0,
    landingMode: false,
  });
  const choreography = useRef({
    initialized: false,
    stageIndex: 0,
    previousProgress: 0,
    direction: 1,
    introSequencePlayed: false,
    philosophyLandingPlayed: false,
  });
  const transitionRange = HOME_CHOREOGRAPHY.introToPhilosophy;
  const philosophyExit = HOME_STAGE.sections.philosophy[1];
  const initialUi = useMemo(() => ({
    stageIndex: 0,
    direction: 1,
    introEntered: false,
    playgroundActive: false,
    basicInteractionActive: false,
    philosophyLanded: false,
    lifterActive: false,
    landingMode: false,
    skillsActive: false,
    skillsCaptionVisible: false,
  }), []);
  const [ui, setUi] = useState(initialUi);
  const uiRef = useRef(initialUi);

  const applyProgress = useCallback((progress, fromTransition = false) => {
    const previousUi = uiRef.current;
    const currentStageIndex = getHomeStageIndex(progress, previousUi.stageIndex);
    const currentStage = HOME_STAGES[currentStageIndex];
    const introProgress = transitionProgressRef.current;
    const transitionOwnsTransform =
      !reducedMotion &&
      progress >= transitionRange.start &&
      (introProgress < 0.999 || currentStage.key === HOME_STAGE_KEYS.PHILOSOPHY);
    const transitionInFlight =
      !reducedMotion &&
      progress >= transitionRange.start &&
      introProgress > 0.001 &&
      introProgress < 0.999;
    const philosophyToPlaygroundProgress = mapRange(
      progress,
      philosophyExit,
      HOME_TARGETS.playground,
      0,
      1
    );
    const philosophyToPlaygroundInFlight =
      !reducedMotion &&
      progress > philosophyExit + 0.0005 &&
      progress < HOME_TARGETS.playground - 0.0005;
    const lifterActive = transitionInFlight || philosophyToPlaygroundInFlight;
    const lifterProgress = transitionInFlight
      ? introProgress
      : philosophyToPlaygroundProgress;
    const transform = transitionOwnsTransform
      ? getIntroToPhilosophyTransform(introProgress, { reducedMotion, viewportWidth })
      : getGundamTransform(progress, { reducedMotion, viewportWidth });

    // ScrollTrigger is the sole high-frequency owner while the custom Intro
    // flight is active. The generic scroll observer still updates DOM panels,
    // but cannot overwrite the flight transform with stale progress.
    if (!transitionOwnsTransform || fromTransition) {
      const motion = motionRef.current;
      motion.rotationY = transform.rotationY;
      motion.rotationZ = transform.rotationZ || 0;
      motion.position[0] = transform.x;
      motion.position[1] = transform.y;
      motion.position[2] = transform.z;
      motion.scale = transform.scale;
      motion.lifterActive = lifterActive;
      motion.lifterProgress = lifterProgress;
      motion.landingMode = progress > philosophyExit;
    }

    const introOpacity = panelOpacity(progress, HOME_STAGE.panelFades.intro);
    const skillsOpacity = panelOpacity(progress, HOME_STAGE.panelFades.skillsBackdrop);
    const playgroundOpacity = panelOpacity(progress, HOME_STAGE.panelFades.playground);
    const playgroundActive =
      currentStage.key === HOME_STAGE_KEYS.PLAYGROUND &&
      playgroundOpacity > 0.4 &&
      !philosophyToPlaygroundInFlight;
    const basicInteractionActive =
      initializationCompleteRef.current &&
      !lifterActive &&
      ((currentStage.key === HOME_STAGE_KEYS.INTRO && introOpacity > 0.4) ||
        (currentStage.key === HOME_STAGE_KEYS.PHILOSOPHY && introProgress >= 0.999));
    const philosophyLanded =
      currentStage.key === HOME_STAGE_KEYS.PHILOSOPHY && introProgress >= 0.999;
    const introEntered =
      currentStage.key === HOME_STAGE_KEYS.INTRO &&
      progress >= HOME_STAGE.panelFades.intro[1];
    const direction = progress >= choreography.current.previousProgress ? 1 : -1;

    if (introPanelRef.current) {
      introPanelRef.current.style.opacity = String(introOpacity);
      introPanelRef.current.setAttribute("aria-hidden", String(introOpacity < 0.5));
    }
    if (playgroundPanelRef.current) {
      playgroundPanelRef.current.style.opacity = String(playgroundOpacity);
      playgroundPanelRef.current.setAttribute("aria-hidden", String(!playgroundActive));
    }
    if (driftWallRef.current) {
      driftWallRef.current.style.opacity = String(skillsOpacity);
      driftWallRef.current.dataset.active = skillsOpacity > 0.02 ? "true" : "false";
    }
    if (skillsCaptionRef.current) {
      skillsCaptionRef.current.style.opacity = String(skillsOpacity);
    }
    if (progressFillRef.current) {
      progressFillRef.current.style.transform = `scaleX(${progress})`;
    }
    if (canvasLayerRef.current) {
      if (!revealRunningRef.current) {
        canvasLayerRef.current.style.opacity = initializationCompleteRef.current
          ? String(transform.opacity)
          : "0";
      }
      canvasLayerRef.current.style.pointerEvents =
        playgroundActive || basicInteractionActive ? "auto" : "none";
    }
    if (headingRef.current) {
      headingRef.current.textContent = String(
        Math.round(((-transform.rotationY * 180) / Math.PI) % 360)
      );
    }
    if (wrapperRef.current) {
      wrapperRef.current.dataset.gundamStage = currentStage.key;
      wrapperRef.current.dataset.gundamDirection = direction > 0 ? "forward" : "reverse";
    }

    choreography.current.initialized = true;
    choreography.current.stageIndex = currentStageIndex;
    choreography.current.previousProgress = progress;
    choreography.current.direction = direction;

    const nextUi = {
      stageIndex: currentStageIndex,
      direction,
      introEntered,
      playgroundActive,
      basicInteractionActive,
      philosophyLanded,
      lifterActive,
      landingMode: progress > philosophyExit,
      skillsActive: skillsOpacity > 0.02,
      skillsCaptionVisible: skillsOpacity > 0.18,
    };
    const changed = Object.keys(nextUi).some((key) => nextUi[key] !== previousUi[key]);
    if (changed) {
      uiRef.current = nextUi;
      setUi(nextUi);
    }
  }, [philosophyExit, reducedMotion, transitionRange.start, viewportWidth]);

  const progressRef = useScrollProgress(wrapperRef, applyProgress);
  const currentStage = HOME_STAGES[ui.stageIndex];

  const handleModelReady = useCallback(() => {
    setModelReady(true);
  }, []);

  useEffect(() => {
    initializationCompleteRef.current = initializationComplete;
    applyProgress(progressRef.current);
  }, [applyProgress, initializationComplete, progressRef]);

  useEffect(() => {
    if (!modelReady || !ui.introEntered || initializationComplete) return undefined;

    if (reducedMotion) {
      setInitializationComplete(true);
      return undefined;
    }

    revealRunningRef.current = true;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          if (canvasLayerRef.current) canvasLayerRef.current.style.willChange = "";
          revealRunningRef.current = false;
          initializationCompleteRef.current = true;
          setInitializationComplete(true);
        },
      });

      timeline
        .set(canvasLayerRef.current, {
          opacity: 0,
          scale: 0.992,
          transformOrigin: "50% 50%",
          willChange: "transform, opacity",
        })
        .set("[data-init-frame]", { opacity: 1 })
        .fromTo(
          "[data-init-status]",
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, duration: 0.18, stagger: 0.12 },
          0.08
        )
        .fromTo(
          "[data-init-scan]",
          { yPercent: -120, opacity: 0 },
          { yPercent: 520, opacity: 1, duration: 1.05, ease: "power1.inOut" },
          0.2
        )
        .to(
          canvasLayerRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.22,
            ease: "power3.out",
          },
          0.58
        )
        .to("[data-init-core]", { opacity: 1, scale: 1.7, duration: 0.18 }, 1.16)
        .to("[data-init-core]", { opacity: 0, scale: 3.2, duration: 0.34 }, 1.34)
        .to("[data-init-frame]", { opacity: 0, duration: 0.3 }, 1.55);
    }, initializationRef);

    return () => {
      revealRunningRef.current = false;
      context.revert();
    };
  }, [initializationComplete, modelReady, reducedMotion, ui.introEntered]);

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
        applyProgress(progressRef.current, true);
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
  }, [applyProgress, progressRef, transitionRange.landingHold, transitionRange.start]);

  useEffect(() => {
    const state = choreography.current;
    const introVisibleAt = HOME_STAGE.panelFades.intro[1];
    if (!modelReady || !initializationComplete || state.introSequencePlayed) return;
    if (currentStage.key !== HOME_STAGE_KEYS.INTRO) return;
    if (progressRef.current < introVisibleAt) return;

    state.introSequencePlayed = true;
    if (reducedMotion) return;

    gundamApiRef.current?.play(CLIPS.BOOMERANG);
  }, [
    currentStage.key,
    gundamApiRef,
    initializationComplete,
    modelReady,
    progressRef,
    reducedMotion,
  ]);

  useEffect(() => {
    const state = choreography.current;

    if (!ui.philosophyLanded) {
      if (transitionProgressRef.current < 0.96) {
        state.philosophyLandingPlayed = false;
      }
      return undefined;
    }

    if (!modelReady || state.philosophyLandingPlayed) return undefined;
    state.philosophyLandingPlayed = true;

    if (reducedMotion) {
      window.dispatchEvent(new CustomEvent("gundam:philosophy-landed"));
      return undefined;
    }

    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        gundamApiRef.current?.play(CLIPS.RIFLE);
        window.dispatchEvent(new CustomEvent("gundam:philosophy-landed"));
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [
    gundamApiRef,
    modelReady,
    reducedMotion,
    ui.philosophyLanded,
  ]);

  return (
    <section
      id="gundam-wrapper"
      ref={wrapperRef}
      className={styles.wrapper}
      data-gundam-stage={currentStage.key}
      data-gundam-direction={ui.direction > 0 ? "forward" : "reverse"}
      aria-label="Interactive Gundam portfolio experience"
    >
      <div className={styles.sticky}>
        <DriftWall
          ref={driftWallRef}
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
          active={ui.skillsActive}
          opacity={0}
        />
        {ui.skillsCaptionVisible && (
          <div
            ref={skillsCaptionRef}
            className={styles.skillsBackdropCaption}
            style={{ opacity: 0 }}
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
          ref={canvasLayerRef}
          className={styles.canvasLayer}
          style={{ opacity: 0, pointerEvents: "none" }}
          aria-hidden="true"
        >
          <Canvas
            shadows
            dpr={viewportWidth <= 720 ? [1, 1.35] : [1, 1.75]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
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
                motionRef={motionRef}
                interactive={ui.playgroundActive}
                basicInteractive={ui.basicInteractionActive}
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
                opacity={0.3}
                scale={12}
                blur={2.4}
                far={4}
                resolution={viewportWidth <= 720 ? 256 : 512}
                color="#000000"
              />
            </Suspense>
          </Canvas>
        </div>

        {!initializationComplete && modelReady && ui.introEntered && (
          <div ref={initializationRef} className={styles.initialization} aria-live="polite">
            <div className={styles.initializationFrame} data-init-frame>
              <span className={styles.initCorner} />
              <span className={styles.initCorner} />
              <span className={styles.initCorner} />
              <span className={styles.initCorner} />
              <span className={styles.scanLine} data-init-scan />
              <span className={styles.corePulse} data-init-core />
              <div className={styles.initReadout}>
                <span data-init-status>UNIT / ZGMF-X09A</span>
                <strong data-init-status>INITIALIZING</strong>
                <span data-init-status>ARMOR BUS · ONLINE</span>
                <span data-init-status>OPTICS · SYNCED</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.vignette} aria-hidden="true" />

        <div className={`${styles.hud} ${styles.hudTopRight}`} aria-hidden="true">
          <span className={styles.stage}>{currentStage.label}</span>
          <br />
          UNIT / ZGMF-X09A
          <br />
          HEADING / <span ref={headingRef}>0</span>°
          {ui.philosophyLanded && (
            <>
              <br />
              <span className={styles.landedStatus}>LIFTER / LANDED</span>
            </>
          )}
        </div>
        <div className={`${styles.hud} ${styles.hudBottomBar}`} aria-hidden="true">
          <div
            ref={progressFillRef}
            className={styles.hudBottomBarFill}
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <div
          ref={introPanelRef}
          className={`${styles.panel} ${styles.panelSplit} ${styles.panelIntro}`}
          data-gundam-panel="intro"
          style={{ opacity: 0 }}
          aria-hidden="true"
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
          ref={playgroundPanelRef}
          className={`${styles.panel} ${styles.panelSplit} ${styles.panelPlayground}`}
          data-gundam-panel="playground"
          style={{
            opacity: 0,
            pointerEvents: "none",
          }}
          aria-hidden={!ui.playgroundActive}
        >
          <PlaygroundContent
            gundamApiRef={gundamApiRef}
            active={ui.playgroundActive}
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
