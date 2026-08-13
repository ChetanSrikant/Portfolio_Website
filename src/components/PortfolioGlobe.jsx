import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import styles from "./PortfolioGlobe.module.css";

const LOCATIONS = [
  {
    id: "india",
    name: "India",
    latitude: 22.35,
    longitude: 78.66,
    label: "Current base",
    description: "The context for my education, engineering practice, and the systems I am building now.",
  },
];

export default function PortfolioGlobe({ locations = LOCATIONS }) {
  const [selected, setSelected] = useState(locations[0] ?? null);

  return (
    <section className={styles.section} aria-labelledby="globe-title">
      <div className={styles.copy}>
        <span className={styles.eyebrow}>// PERSPECTIVE</span>
        <h2 id="globe-title" className={styles.title}>One place that shaped the perspective.</h2>
        <p className={styles.description}>
          This map only carries places with a verified connection to my work or life. It can grow when the story does.
        </p>

        <div className={styles.locationPicker} aria-label="Select a location">
          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              className={selected?.id === location.id ? styles.locationButtonActive : styles.locationButton}
              onClick={() => setSelected(location)}
              aria-pressed={selected?.id === location.id}
            >
              <span>{location.name}</span>
              <span>{location.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.locationDetail} aria-live="polite">
          {selected ? (
            <>
              <span className={styles.locationType}>{selected.label}</span>
              <strong className={styles.locationName}>{selected.name}</strong>
              <p className={styles.locationDescription}>{selected.description}</p>
            </>
          ) : (
            <p className={styles.emptyState}>Verified location markers will appear here as the story grows.</p>
          )}
        </div>
      </div>

      <div className={styles.canvasWrap} aria-hidden="true">
        <div className={styles.dragHint}>Drag to rotate</div>
        <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 5.2]} fov={35} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 3, 5]} intensity={2} color="#fff5df" />
          <pointLight position={[-4, 1, -2]} intensity={8} color="#c9a24b" />
          <GlobeScene locations={locations} selected={selected} onSelect={setSelected} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.45}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.72}
          />
        </Canvas>
      </div>
    </section>
  );
}

function GlobeScene({ locations, selected, onSelect }) {
  const globeRef = useRef(null);
  const reduceMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame((_, delta) => {
    if (!globeRef.current || reduceMotion) return;
    globeRef.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={globeRef}>
      <GlobeBody />
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          active={selected?.id === location.id}
          reduceMotion={reduceMotion}
          onSelect={() => onSelect(location)}
        />
      ))}
    </group>
  );
}

function GlobeBody() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.62, 64, 64]} />
        <meshStandardMaterial color="#090909" roughness={0.7} metalness={0.15} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.635, 32, 24]} />
        <meshBasicMaterial color="#777772" wireframe transparent opacity={0.12} />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[1.62, 48, 48]} />
        <meshBasicMaterial color="#c9a24b" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>
      <LatitudeLines />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.65, 0.0035, 8, 128]} />
        <meshBasicMaterial color="#c9a24b" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

function LatitudeLines() {
  return [-60, -30, 30, 60].map((latitude) => {
    const phi = THREE.MathUtils.degToRad(latitude);
    const radius = 1.64 * Math.cos(phi);
    const y = 1.64 * Math.sin(phi);
    return (
      <mesh key={latitude} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.0025, 6, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.07} />
      </mesh>
    );
  });
}

function LocationMarker({ location, active, reduceMotion, onSelect }) {
  const markerRef = useRef(null);
  const position = useMemo(
    () => latLonToVector3(location.latitude, location.longitude, 1.68),
    [location.latitude, location.longitude],
  );

  useFrame((state) => {
    if (!markerRef.current) return;
    const pulse = reduceMotion ? 1 : 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
    markerRef.current.scale.setScalar(active ? pulse * 1.25 : pulse);
  });

  return (
    <group position={position}>
      <mesh
        ref={markerRef}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[0.04, 18, 18]} />
        <meshBasicMaterial color={active ? "#c9a24b" : "#f1eee6"} />
      </mesh>
      <mesh scale={active ? 1.7 : 1}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color="#c9a24b" transparent opacity={active ? 0.16 : 0.07} />
      </mesh>
    </group>
  );
}

function latLonToVector3(latitude, longitude, radius) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    -radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon),
  );
}
