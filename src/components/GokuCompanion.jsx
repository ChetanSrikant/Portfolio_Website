import React, {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./GokuCompanion.module.css";

const MODEL_URL = "/models/son-goku.glb";
const WAVE_DURATION_MS = 9000;
const STANCE_DURATION_MS = 8000;

const GOKU_CLIPS = {
  IDLE: "00-IDLE",
  WAVE: "01-OSSU",
  STANCE: "02-STANCE",
  KAMEHAMEHA: "03-KAMEHAMEHA",
};

const INITIAL_POSE_BY_PATH = {
  "/about": { clip: GOKU_CLIPS.WAVE, progress: 0.12, holdMs: 2600 },
  "/work": { clip: GOKU_CLIPS.STANCE, progress: 0.2, holdMs: 3000 },
  "/projects": { clip: GOKU_CLIPS.IDLE, progress: 0.46, holdMs: 2800 },
  "/beyond": { clip: GOKU_CLIPS.WAVE, progress: 0.62, holdMs: 2700 },
  "/credentials": { clip: GOKU_CLIPS.STANCE, progress: 0.74, holdMs: 3000 },
};

const DEFAULT_INITIAL_POSE = {
  clip: GOKU_CLIPS.STANCE,
  progress: 0.54,
  holdMs: 2800,
};

const GokuFigure = forwardRef(function GokuFigure(
  { reducedMotion, initialPose, onActionChange, onReady },
  ref
) {
  const groupRef = useRef(null);
  const attackLockedRef = useRef(false);
  const stanceActiveRef = useRef(false);
  const cycleTimerRef = useRef(null);
  const finishedHandlerRef = useRef(null);
  const returnTimerRef = useRef(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const compatibleAnimations = useMemo(
    () =>
      animations.map(
        (clip) =>
          new THREE.AnimationClip(
            clip.name,
            clip.duration,
            clip.tracks.filter(
              (track) => !track.name.includes("morphTargetInfluences")
            )
          )
      ),
    [animations]
  );
  const normalization = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    const targetHeight = 2.08;
    const scale = size.y > 0 ? targetHeight / size.y : 1;

    return {
      scale,
      position: [
        -center.x * scale,
        -center.y * scale - 0.08,
        -center.z * scale,
      ],
    };
  }, [scene]);
  const { actions, mixer } = useAnimations(compatibleAnimations, groupRef);

  useEffect(() => {
    scene.traverse((object) => {
      if (!object.isMesh) return;
      object.frustumCulled = false;
      object.castShadow = false;
      object.receiveShadow = false;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        if (!material) return;
        material.envMapIntensity = 0.85;
        material.needsUpdate = true;
      });
    });
  }, [scene]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const removeFinishedHandler = () => {
    if (!finishedHandlerRef.current) return;
    mixer.removeEventListener("finished", finishedHandlerRef.current);
    finishedHandlerRef.current = null;
  };

  const clearCycleTimer = () => {
    if (!cycleTimerRef.current) return;
    window.clearTimeout(cycleTimerRef.current);
    cycleTimerRef.current = null;
  };

  const playStance = () => {
    clearCycleTimer();
    if (attackLockedRef.current) return;

    removeFinishedHandler();
    const idle = actions[GOKU_CLIPS.IDLE];
    const wave = actions[GOKU_CLIPS.WAVE];
    const stance = actions[GOKU_CLIPS.STANCE];
    if (!stance) return;

    stanceActiveRef.current = true;
    idle?.fadeOut(0.24);
    wave?.fadeOut(0.24);
    stance.reset().fadeIn(0.28).play();

    if (reducedMotion) {
      stance.setLoop(THREE.LoopOnce, 1);
      stance.paused = true;
      stance.time = stance.getClip().duration * 0.42;
      mixer.update(0);
      return;
    }

    stance.paused = false;
    stance.setEffectiveTimeScale(0.9);
    stance.setLoop(THREE.LoopRepeat, Infinity);
    cycleTimerRef.current = window.setTimeout(playWave, STANCE_DURATION_MS);
  };

  const playWave = () => {
    clearCycleTimer();
    removeFinishedHandler();
    const idle = actions[GOKU_CLIPS.IDLE];
    const wave = actions[GOKU_CLIPS.WAVE];
    const stance = actions[GOKU_CLIPS.STANCE];
    const attack = actions[GOKU_CLIPS.KAMEHAMEHA];
    stanceActiveRef.current = false;
    stance?.fadeOut(0.2);
    attack?.fadeOut(0.18);

    if (!wave) return;
    idle?.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    mixer.update(0);
    wave.reset().play();

    if (reducedMotion) {
      wave.setLoop(THREE.LoopOnce, 1);
      wave.paused = true;
      wave.time = Math.min(1.15, wave.getClip().duration * 0.2);
      mixer.update(0);
      return;
    }

    wave.paused = false;
    wave.setEffectiveTimeScale(0.92);
    wave.setLoop(THREE.LoopRepeat, Infinity);
    if (idle) wave.crossFadeFrom(idle, 0.28, true);
    cycleTimerRef.current = window.setTimeout(playStance, WAVE_DURATION_MS);
  };

  const playInitialPose = () => {
    clearCycleTimer();
    removeFinishedHandler();

    const action = actions[initialPose.clip];
    if (!action) {
      playWave();
      return;
    }

    stanceActiveRef.current = initialPose.clip === GOKU_CLIPS.STANCE;
    Object.values(actions).forEach((candidate) => {
      if (candidate !== action) candidate?.fadeOut(0.12);
    });

    action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    action.time = action.getClip().duration * initialPose.progress;
    mixer.update(0);

    if (reducedMotion) {
      action.paused = true;
      return;
    }

    action.paused = false;
    action.setEffectiveTimeScale(initialPose.clip === GOKU_CLIPS.IDLE ? 0.82 : 0.92);
    cycleTimerRef.current = window.setTimeout(playWave, initialPose.holdMs);
  };

  useEffect(() => {
    playInitialPose();

    return () => {
      removeFinishedHandler();
      clearCycleTimer();
      if (returnTimerRef.current) window.clearTimeout(returnTimerRef.current);
      Object.values(actions).forEach((action) => action?.stop());
    };
    // The loaded actions object is stable for this mounted model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, initialPose, reducedMotion]);

  const playKamehameha = () => {
    if (attackLockedRef.current) return;

    const attack = actions[GOKU_CLIPS.KAMEHAMEHA];
    if (!attack) return;

    attackLockedRef.current = true;
    clearCycleTimer();
    stanceActiveRef.current = false;
    onActionChange?.(true);
    removeFinishedHandler();

    const finishAttack = () => {
      attackLockedRef.current = false;
      onActionChange?.(false);
      playWave();
    };

    const wave = actions[GOKU_CLIPS.WAVE];
    const stance = actions[GOKU_CLIPS.STANCE];
    wave?.fadeOut(0.16);
    stance?.fadeOut(0.16);
    attack.reset().fadeIn(0.16).play();
    attack.setLoop(THREE.LoopOnce, 1);
    attack.clampWhenFinished = true;

    if (reducedMotion) {
      attack.paused = true;
      attack.time = attack.getClip().duration * 0.68;
      mixer.update(0);
      returnTimerRef.current = window.setTimeout(finishAttack, 500);
      return;
    }

    attack.paused = false;
    attack.setEffectiveTimeScale(1.12);

    const handleFinished = (event) => {
      if (event.action !== attack) return;
      removeFinishedHandler();
      finishAttack();
    };

    finishedHandlerRef.current = handleFinished;
    mixer.addEventListener("finished", handleFinished);
  };

  useImperativeHandle(ref, () => ({
    playKamehameha,
    noteActivity: () => {
      if (attackLockedRef.current) return;
      if (stanceActiveRef.current) {
        playWave();
        return;
      }
      clearCycleTimer();
      cycleTimerRef.current = window.setTimeout(playStance, WAVE_DURATION_MS);
    },
  }));

  return (
    <group ref={groupRef}>
      <group scale={normalization.scale} position={normalization.position}>
        <primitive object={scene} />
      </group>
    </group>
  );
});

function GokuScene({
  figureRef,
  reducedMotion,
  initialPose,
  onActionChange,
  onReady,
}) {
  return (
    <>
      <ambientLight intensity={1.45} />
      <hemisphereLight args={["#e9f4ff", "#25160c", 1.65]} />
      <directionalLight position={[2.8, 3.8, 4]} intensity={2.25} />
      <directionalLight position={[-3, 1, 2]} intensity={0.9} color="#7fc9ff" />
      <GokuFigure
        ref={figureRef}
        reducedMotion={reducedMotion}
        initialPose={initialPose}
        onActionChange={onActionChange}
        onReady={onReady}
      />
    </>
  );
}

export default function GokuCompanion() {
  const figureRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const [attacking, setAttacking] = useState(false);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const initialPose = INITIAL_POSE_BY_PATH[path] ?? DEFAULT_INITIAL_POSE;

  return (
    <button
      type="button"
      className={`${styles.companion} ${ready ? styles.ready : ""} ${
        attacking ? styles.attacking : ""
      }`}
      onClick={() => {
        figureRef.current?.playKamehameha();
      }}
      onPointerEnter={() => figureRef.current?.noteActivity()}
      onFocus={() => figureRef.current?.noteActivity()}
      disabled={!ready || attacking}
      aria-label={
        attacking
          ? "Goku is performing Kamehameha"
          : "Play Goku Kamehameha animation"
      }
      title="Click Goku for Kamehameha"
    >
      <span className={styles.energy} aria-hidden="true" />
      <span className={styles.canvasWrap} aria-hidden="true">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.05, 5.15], fov: 27, near: 0.1, far: 30 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Suspense fallback={null}>
            <GokuScene
              figureRef={figureRef}
              reducedMotion={reducedMotion}
              initialPose={initialPose}
              onActionChange={setAttacking}
              onReady={handleReady}
            />
          </Suspense>
        </Canvas>
      </span>
      <span className={styles.srOnly}>
        Son Goku model by みそ太郎, sourced from Sketchfab.
      </span>
    </button>
  );
}

useGLTF.preload(MODEL_URL);
