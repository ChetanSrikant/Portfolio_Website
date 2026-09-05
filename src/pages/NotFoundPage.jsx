import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, PerspectiveCamera } from "@react-three/drei";
import InternalPageShell from "../components/InternalPageShell.jsx";
import GundamModel, { CLIPS } from "../components/GundamModel.jsx";
import PlaygroundContent from "../components/Playground.jsx";
import KineticTextLoader from "../components/KineticTextLoader.jsx";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./RouteStatusPage.module.css";

function NotFoundLighting() {
  return (
    <>
      <ambientLight intensity={0.52} />
      <hemisphereLight args={["#54545f", "#0a0a0a", 0.58]} />
      <directionalLight position={[4, 6, 4]} intensity={1.85} color="#fff3dd" castShadow />
      <directionalLight position={[-3, 3, -5]} intensity={2} color="#c9a24b" />
      <directionalLight position={[-5, 2, 3]} intensity={0.68} color="#8697ad" />
    </>
  );
}

export default function NotFoundPage() {
  const gundamApiRef = useRef(null);
  const [modelReady, setModelReady] = useState(false);
  const reducedMotion = useReducedMotionPreference();

  return (
    <InternalPageShell title="Page not found" showAmbient={false} showDock={false} showFooterStatement={false}>
      <section className={styles.notFound} aria-labelledby="not-found-title">
        <div className={styles.copy}>
          <span className={styles.errorCode}>404 / Route unavailable</span>
          <h1 id="not-found-title">This page isn&apos;t here. The Gundam is.</h1>
          <p>Try an authored move, inspect the model, or return to the portfolio.</p>
          <a className={styles.homeLink} href="/">Return home</a>
          <code className={styles.route}>{window.location.pathname}</code>
        </div>

        <div className={styles.playArea}>
          <div className={styles.modelViewport} aria-label="Interactive Justice Gundam model">
            {!modelReady && (
              <div className={styles.loadingOverlay} role="status">
                <KineticTextLoader text="INITIALIZING UNIT" accessibleLabel="Initializing Gundam model" />
              </div>
            )}
            <Canvas
              shadows
              dpr={[1, 1.5]}
              gl={{ antialias: true, powerPreference: "high-performance" }}
              fallback={<div className={styles.fallback}>The 3D unit is unavailable.</div>}
            >
              <PerspectiveCamera makeDefault position={[0, 1.2, 7.4]} fov={40} />
              <NotFoundLighting />
              <Suspense fallback={<Html center><span className={styles.canvasLoading}>Loading unit</span></Html>}>
                <GundamModel
                  ref={gundamApiRef}
                  targetPosition={[0, -1.1, 0]}
                  targetScale={1.2}
                  interactive
                  reducedMotion={reducedMotion}
                  onReady={() => setModelReady(true)}
                  onSingleClick={() => gundamApiRef.current?.play(CLIPS.SABER)}
                  onDoubleClick={() => gundamApiRef.current?.play(CLIPS.SHIELD)}
                />
                <ContactShadows
                  position={[0, -1.08, 0]}
                  opacity={0.32}
                  scale={12}
                  blur={2.4}
                  far={4}
                  resolution={256}
                  color="#000000"
                />
              </Suspense>
            </Canvas>
          </div>
          <PlaygroundContent gundamApiRef={gundamApiRef} active={modelReady} />
        </div>
      </section>
    </InternalPageShell>
  );
}
