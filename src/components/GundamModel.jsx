import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const MODEL_URL = "/models/justice-gundam.glb";

// Clip names baked into the rig.
export const CLIPS = {
  IDLE: "00-IDLE",
  SABER: "01-SABER",
  RIFLE: "02-RIFLE",
  SHIELD: "03-SHILD", // spelling as authored in the rig
  BOOMERANG: "04-BOOMERANG",
  LIFTER: "05-LIFTER",
  STATIC: "Static",
};

const DOUBLE_CLICK_MS = 280;
const DRAG_THRESHOLD_PX = 6;
const DRAG_RADIANS_PER_PX = 0.009;

const GundamModel = forwardRef(function GundamModel(
  {
    targetRotationY = 0,
    targetPosition = [0, 0, 0],
    targetScale = 1,
    dampFactor = 4,
    positionDampFactor = 3,
    scaleDampFactor = 3,
    onSingleClick,
    onDoubleClick,
    onHoverChange,
    ...props
  },
  ref
) {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, mixer, names } = useAnimations(animations, group);

  const lastClickTime = useRef(0);
  const pendingSingleClick = useRef(null);
  const activeFinishedHandler = useRef(null);
  const drag = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    lastX: 0,
    distance: 0,
  });
  const manualRotationTargetY = useRef(0);

  useEffect(() => {
    return () => {
      if (pendingSingleClick.current) clearTimeout(pendingSingleClick.current);
      if (activeFinishedHandler.current) {
        mixer.removeEventListener("finished", activeFinishedHandler.current);
      }
      document.body.style.cursor = "auto";
    };
  }, [mixer]);

  // Normalize scale/position regardless of the glb's authored units, and
  // tune materials (grounded shadows, punchy beam-saber glow).
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    let scale = 1;
    if (size.y > 0) {
      // NOTE: the rig's bind pose is "exploded" — backpack wings, shield,
      // rifle, and beam sabers all rest detached above/beside the body
      // rather than mounted on it. That roughly doubles the bind-pose
      // bounding height vs. the assembled idle silhouette, so a plain
      // fit-to-bbox scale reads as too small once the idle clip pulls
      // everything back onto the body. BIND_POSE_INFLATION corrects for it
      // — tune this (or replace with a hand-measured value) if the rig
      // changes.
      const BIND_POSE_INFLATION = 1.4;
      const targetHeight = 3.4;
      scale = (targetHeight / size.y) * BIND_POSE_INFLATION;
      scene.scale.setScalar(scale);
    }

    const box2 = new THREE.Box3().setFromObject(scene);
    const center2 = new THREE.Vector3();
    box2.getCenter(center2);
    scene.position.x -= center2.x;
    scene.position.y -= box2.min.y;
    scene.position.z -= center2.z;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          if (obj.material.name === "BEAM") {
            obj.material.emissiveIntensity = 2.4;
            obj.material.toneMapped = false;
          } else {
            obj.material.envMapIntensity = 0.9;
          }
        }
      }
    });
  }, [scene]);

  // Idle loop on mount.
  useEffect(() => {
    const idle = actions[CLIPS.IDLE];
    if (idle) {
      idle.reset().fadeIn(0.4).play();
      idle.setLoop(THREE.LoopRepeat, Infinity);
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  // Crossfade helper: play a clip once, then settle back to idle.
  const playOnce = (clipName) => {
    const target = actions[clipName];
    const idle = actions[CLIPS.IDLE];
    if (!target) return;

    if (activeFinishedHandler.current) {
      mixer.removeEventListener("finished", activeFinishedHandler.current);
      activeFinishedHandler.current = null;
    }

    Object.entries(actions).forEach(([name, action]) => {
      if (name !== clipName) action?.fadeOut(0.3);
    });

    target.reset();
    target.setLoop(THREE.LoopOnce, 1);
    target.clampWhenFinished = true;
    target.fadeIn(0.25).play();

    if (clipName === CLIPS.STATIC) return;

    const handleFinished = (e) => {
      if (e.action === target) {
        mixer.removeEventListener("finished", handleFinished);
        activeFinishedHandler.current = null;
        idle?.reset().fadeIn(0.5).play();
        target.fadeOut(0.5);
      }
    };
    activeFinishedHandler.current = handleFinished;
    mixer.addEventListener("finished", handleFinished);
  };

  const playIdle = () => {
    if (activeFinishedHandler.current) {
      mixer.removeEventListener("finished", activeFinishedHandler.current);
      activeFinishedHandler.current = null;
    }
    Object.entries(actions).forEach(([name, action]) => {
      if (name !== CLIPS.IDLE) action?.fadeOut(0.3);
    });
    actions[CLIPS.IDLE]?.reset().fadeIn(0.4).play();
  };

  useImperativeHandle(ref, () => ({
    play: playOnce,
    playIdle,
    clipNames: names,
    resetRotation: () => {
      manualRotationTargetY.current = 0;
    },
  }));

  // Smoothly damp toward the externally-driven target rotation & position
  // (scroll-linked turn + reposition between stops).
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetRotationY + manualRotationTargetY.current,
      dampFactor,
      delta
    );
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      targetPosition[0],
      positionDampFactor,
      delta
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      targetPosition[1],
      positionDampFactor,
      delta
    );
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      targetPosition[2],
      positionDampFactor,
      delta
    );
    const dampedScale = THREE.MathUtils.damp(
      group.current.scale.x,
      targetScale,
      scaleDampFactor,
      delta
    );
    group.current.scale.setScalar(dampedScale);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (drag.current.distance >= DRAG_THRESHOLD_PX) return;

    const now = performance.now();
    const sinceLast = now - lastClickTime.current;
    lastClickTime.current = now;

    if (sinceLast < DOUBLE_CLICK_MS) {
      if (pendingSingleClick.current) {
        clearTimeout(pendingSingleClick.current);
        pendingSingleClick.current = null;
      }
      onDoubleClick?.();
    } else {
      pendingSingleClick.current = setTimeout(() => {
        pendingSingleClick.current = null;
        onSingleClick?.();
      }, DOUBLE_CLICK_MS);
    }
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    drag.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      lastX: e.clientX,
      distance: 0,
    };
    e.target.setPointerCapture?.(e.pointerId);
    document.body.style.cursor = "grabbing";
  };

  const handlePointerMove = (e) => {
    if (!drag.current.active || drag.current.pointerId !== e.pointerId) return;
    e.stopPropagation();

    const deltaX = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    drag.current.distance = Math.max(
      drag.current.distance,
      Math.abs(e.clientX - drag.current.startX)
    );
    if (
      drag.current.distance >= DRAG_THRESHOLD_PX &&
      pendingSingleClick.current
    ) {
      clearTimeout(pendingSingleClick.current);
      pendingSingleClick.current = null;
    }
    manualRotationTargetY.current += deltaX * DRAG_RADIANS_PER_PX;
  };

  const finishDrag = (e) => {
    if (!drag.current.active || drag.current.pointerId !== e.pointerId) return;
    e.stopPropagation();
    e.target.releasePointerCapture?.(e.pointerId);
    drag.current.active = false;
    drag.current.pointerId = null;
    document.body.style.cursor = "grab";
  };

  return (
    <group
      ref={group}
      {...props}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!drag.current.active) document.body.style.cursor = "grab";
        onHoverChange?.(true);
      }}
      onPointerOut={(e) => {
        if (!drag.current.active) document.body.style.cursor = "auto";
        onHoverChange?.(false);
      }}
    >
      <primitive object={scene} />
    </group>
  );
});

useGLTF.preload(MODEL_URL);

export default GundamModel;
