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
import styles from "./StrikeCompanion.module.css";

const MODEL_URL = "/models/gat-x105-aile-strike.glb";

const STRIKE_CLIPS = Object.freeze({
  POSE: "00-POSE",
  APPEAR: "01-APPEAR",
  IDLE: "02-IDLE",
  RIFLE: "03-RIFLE",
  KICK: "04-KICK",
  POSE_ALT: "99-POSE2",
});

const ROUTE_PROFILES = Object.freeze({
  "/about": {
    entry: STRIKE_CLIPS.POSE,
    action: STRIKE_CLIPS.KICK,
    actionLabel: "close-combat kick",
    tone: "cyan",
  },
  "/work": {
    entry: STRIKE_CLIPS.RIFLE,
    action: STRIKE_CLIPS.RIFLE,
    actionLabel: "rifle sequence",
    tone: "red",
  },
  "/projects": {
    entry: STRIKE_CLIPS.KICK,
    action: STRIKE_CLIPS.KICK,
    actionLabel: "close-combat kick",
    tone: "violet",
  },
  "/beyond": {
    entry: STRIKE_CLIPS.POSE_ALT,
    action: STRIKE_CLIPS.RIFLE,
    actionLabel: "rifle sequence",
    tone: "blue",
  },
  "/credentials": {
    entry: STRIKE_CLIPS.APPEAR,
    action: STRIKE_CLIPS.KICK,
    actionLabel: "close-combat kick",
    tone: "green",
  },
});

const DEFAULT_PROFILE = Object.freeze({
  entry: STRIKE_CLIPS.IDLE,
  action: STRIKE_CLIPS.RIFLE,
  actionLabel: "rifle sequence",
  tone: "gold",
});

const STATIC_CLIPS = new Set([STRIKE_CLIPS.POSE, STRIKE_CLIPS.POSE_ALT]);

const StrikeFigure = forwardRef(function StrikeFigure(
  { profile, reducedMotion, onActionChange, onReady },
  ref
) {
  const groupRef = useRef(null);
  const actionLockedRef = useRef(false);
  const finishedHandlerRef = useRef(null);
  const reducedReturnTimerRef = useRef(null);
  const readySignalledRef = useRef(false);
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

    const targetHeight = 2.12;
    const scale = size.y > 0 ? targetHeight / size.y : 1;

    return {
      scale,
      position: [
        -center.x * scale,
        -center.y * scale - 0.02,
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
        material.envMapIntensity = 1.05;
        material.needsUpdate = true;
      });
    });
  }, [scene]);

  useEffect(() => {
    if (readySignalledRef.current || !actions[STRIKE_CLIPS.IDLE]) return;
    readySignalledRef.current = true;
    onReady?.();
  }, [actions, onReady]);

  const removeFinishedHandler = () => {
    if (!finishedHandlerRef.current) return;
    mixer.removeEventListener("finished", finishedHandlerRef.current);
    finishedHandlerRef.current = null;
  };

  const stopReducedReturnTimer = () => {
    if (!reducedReturnTimerRef.current) return;
    window.clearTimeout(reducedReturnTimerRef.current);
    reducedReturnTimerRef.current = null;
  };

  const fadeOutOtherActions = (activeAction, duration = 0.18) => {
    Object.values(actions).forEach((candidate) => {
      if (candidate && candidate !== activeAction) candidate.fadeOut(duration);
    });
  };

  const playIdle = (fadeDuration = 0.34) => {
    removeFinishedHandler();
    stopReducedReturnTimer();
    actionLockedRef.current = false;
    onActionChange?.(null);

    const idle = actions[STRIKE_CLIPS.IDLE];
    if (!idle) return;
    fadeOutOtherActions(idle, fadeDuration);
    idle
      .reset()
      .setEffectiveTimeScale(0.82)
      .setLoop(THREE.LoopRepeat, Infinity)
      .fadeIn(fadeDuration)
      .play();

    if (reducedMotion) {
      idle.paused = true;
      idle.time = idle.getClip().duration * 0.38;
      mixer.update(0);
    }
  };

  const playStaticPose = (clipName) => {
    removeFinishedHandler();
    stopReducedReturnTimer();
    actionLockedRef.current = false;
    onActionChange?.(null);

    const pose = actions[clipName];
    if (!pose) {
      playIdle();
      return;
    }
    fadeOutOtherActions(pose, 0.16);
    pose.reset().setLoop(THREE.LoopOnce, 1).play();
    pose.paused = true;
    pose.time = Math.min(pose.getClip().duration, 0.001);
    mixer.update(0);
  };

  const playOneShot = (clipName, { entry = false } = {}) => {
    if (actionLockedRef.current && !entry) return;

    const action = actions[clipName];
    if (!action) {
      playIdle();
      return;
    }

    removeFinishedHandler();
    stopReducedReturnTimer();
    actionLockedRef.current = true;
    onActionChange?.(clipName);
    fadeOutOtherActions(action, 0.16);

    action
      .reset()
      .setLoop(THREE.LoopOnce, 1)
      .setEffectiveTimeScale(entry ? 1.16 : 1.28)
      .fadeIn(0.18)
      .play();
    action.clampWhenFinished = true;

    const finish = () => playIdle(0.42);

    if (reducedMotion) {
      action.paused = true;
      action.time = action.getClip().duration * 0.58;
      mixer.update(0);
      reducedReturnTimerRef.current = window.setTimeout(finish, 650);
      return;
    }

    const handleFinished = (event) => {
      if (event.action !== action) return;
      removeFinishedHandler();
      finish();
    };
    finishedHandlerRef.current = handleFinished;
    mixer.addEventListener("finished", handleFinished);
  };

  useEffect(() => {
    if (!actions[profile.entry]) return undefined;

    if (STATIC_CLIPS.has(profile.entry)) {
      playStaticPose(profile.entry);
    } else if (profile.entry === STRIKE_CLIPS.IDLE) {
      playIdle();
    } else {
      playOneShot(profile.entry, { entry: true });
    }

    return () => {
      removeFinishedHandler();
      stopReducedReturnTimer();
      Object.values(actions).forEach((action) => action?.stop());
    };
    // Animation actions are stable for the mounted GLB instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, profile, reducedMotion]);

  useImperativeHandle(ref, () => ({
    playRouteAction: () => playOneShot(profile.action),
  }));

  return (
    <group ref={groupRef} rotation={[0, -0.16, 0]}>
      <group scale={normalization.scale} position={normalization.position}>
        <primitive object={scene} />
      </group>
    </group>
  );
});

function StrikeScene({ figureRef, profile, reducedMotion, onActionChange, onReady }) {
  return (
    <>
      <ambientLight intensity={1.25} />
      <hemisphereLight args={["#edf5ff", "#11131b", 1.45]} />
      <directionalLight position={[3.2, 4.5, 4]} intensity={2.45} color="#fff8e8" />
      <directionalLight position={[-3, 2, 2]} intensity={1.15} color="#80bfff" />
      <StrikeFigure
        ref={figureRef}
        profile={profile}
        reducedMotion={reducedMotion}
        onActionChange={onActionChange}
        onReady={onReady}
      />
    </>
  );
}

export default function StrikeCompanion() {
  const figureRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();
  const [activeAction, setActiveAction] = useState(null);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const profile = ROUTE_PROFILES[path] ?? DEFAULT_PROFILE;
  const busy = Boolean(activeAction);
  const actionType = activeAction === STRIKE_CLIPS.KICK ? "kick" : activeAction ? "rifle" : "idle";

  return (
    <button
      type="button"
      className={`${styles.companion} ${ready ? styles.ready : ""} ${
        busy ? styles.active : ""
      }`}
      data-tone={profile.tone}
      data-action={actionType}
      onClick={() => figureRef.current?.playRouteAction()}
      disabled={!ready || busy}
      aria-label={
        busy
          ? `Aile Strike is performing its ${profile.actionLabel}`
          : `Play Aile Strike ${profile.actionLabel}`
      }
      title={`Click Aile Strike for ${profile.actionLabel}`}
    >
      <span className={styles.thrusterGlow} aria-hidden="true" />
      <span className={styles.actionPulse} aria-hidden="true" />
      <span className={styles.canvasWrap} aria-hidden="true">
        <Canvas
          dpr={reducedMotion ? 1 : [1, 1.35]}
          frameloop={reducedMotion ? "demand" : "always"}
          camera={{ position: [0, 0.02, 5.7], fov: 29, near: 0.1, far: 30 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Suspense fallback={null}>
            <StrikeScene
              figureRef={figureRef}
              profile={profile}
              reducedMotion={reducedMotion}
              onActionChange={setActiveAction}
              onReady={handleReady}
            />
          </Suspense>
        </Canvas>
      </span>
      <span className={styles.prompt} aria-hidden="true">
        CLICK / {profile.action === STRIKE_CLIPS.KICK ? "KICK" : "RIFLE"}
      </span>
      <span className={styles.srOnly}>
        GAT-X105 Aile Strike model by みそ太郎, licensed CC BY 4.0 and sourced from Sketchfab.
      </span>
    </button>
  );
}

useGLTF.preload(MODEL_URL);
