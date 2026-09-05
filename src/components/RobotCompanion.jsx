import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";

const MODEL_URL = "/models/cute-robot-companion.glb";

function RobotAsset({ reducedMotion }) {
  const groupRef = useRef(null);
  const { scene } = useGLTF(MODEL_URL);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
  }, [scene]);

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.05) * 0.035;
  });

  return (
    <group ref={groupRef} rotation={[0, -0.38, 0]} scale={2.08}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function RobotCompanion({ className = "" }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "160px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Interactive 3D view of a robot companion"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible && !reducedMotion ? "always" : "demand"}
        camera={{ position: [0, 0.08, 4.7], fov: 32, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <ambientLight intensity={1.1} />
        <hemisphereLight args={["#f6e7c5", "#121217", 1.15]} />
        <directionalLight position={[3, 4, 4]} intensity={2.5} color="#fff4dc" castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={1.15} color="#e0bb63" />

        <Suspense fallback={null}>
          <RobotAsset reducedMotion={reducedMotion} />
          <ContactShadows
            position={[0, -1.02, 0]}
            opacity={0.34}
            scale={3.2}
            blur={2.6}
            far={2.4}
            resolution={256}
            color="#070708"
          />
        </Suspense>

        <OrbitControls
          makeDefault
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.72}
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.34}
          maxPolarAngle={Math.PI * 0.66}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
