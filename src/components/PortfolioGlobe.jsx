import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./PortfolioGlobe.module.css";

const ORIGIN = {
  name:"India",
  latitude:22.35,
  longitude:78.66,
  label:"Current base",
  coordinates:"22.35° N / 78.66° E",
  description:"The context for my education, engineering practice, and the software I am building now.",
};

export default function PortfolioGlobe({ location = ORIGIN, autoRotate = true, autoRotateSpeed = .28 }) {
  const [interacting,setInteracting] = useState(false);
  const [visible,setVisible] = useState(false);
  const sectionRef = useRef(null);
  const reduced = useReducedMotionPreference();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "20% 0px", threshold: 0.01 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="globe-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>Origin and perspective</span>
          <h2 id="globe-title">Built from here. Looking outward.</h2>
          <p className={styles.description}>One verified location is enough for now. The globe is a quiet reminder that where you build from shapes how you see the problem.</p>
          <div className={styles.locationCard}>
            <div><span>{location.label}</span><span>{location.coordinates}</span></div>
            <strong>{location.name}</strong>
            <p>{location.description}</p>
          </div>
        </div>
        <div className={styles.canvasWrap} aria-label="Interactive globe showing India. Drag to rotate." role="img">
          <span className={styles.dragHint}>Drag to inspect</span>
          <span className={styles.axisLabel}>N / 00</span>
          <Canvas frameloop={visible ? "always" : "demand"} dpr={[1,1.5]} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}}>
            <PerspectiveCamera makeDefault position={[0,0,5.2]} fov={35}/>
            <ambientLight intensity={.5}/><directionalLight position={[4,3,5]} intensity={2.1} color="#fff5df"/><pointLight position={[-4,1,-2]} intensity={7.5} color="#c9a24b"/>
            <GlobeScene location={location} spin={visible && autoRotate && !reduced && !interacting} speed={autoRotateSpeed} reduced={reduced}/>
            <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={.42} minPolarAngle={Math.PI*.28} maxPolarAngle={Math.PI*.72} onStart={() => setInteracting(true)} onEnd={() => setInteracting(false)}/>
          </Canvas>
        </div>
      </div>
    </section>
  );
}

function GlobeScene({ location, spin, speed, reduced }) {
  const globeRef = useRef(null);
  useFrame((_,delta) => { if(globeRef.current && spin) globeRef.current.rotation.y += delta * speed * .1; });
  return <group ref={globeRef} rotation={[.08,-.3,-.04]}><GlobeBody/><LocationMarker location={location} reduced={reduced}/></group>;
}

function GlobeBody() {
  return <group>
    <mesh><sphereGeometry args={[1.62,64,64]}/><meshStandardMaterial color="#090909" roughness={.76} metalness={.2}/></mesh>
    <mesh><sphereGeometry args={[1.635,32,24]}/><meshBasicMaterial color="#8a857a" wireframe transparent opacity={.12}/></mesh>
    <mesh scale={1.04}><sphereGeometry args={[1.62,48,48]}/><meshBasicMaterial color="#c9a24b" transparent opacity={.045} side={THREE.BackSide}/></mesh>
    {[-60,-30,30,60].map((latitude) => { const phi=THREE.MathUtils.degToRad(latitude); return <mesh key={latitude} position={[0,1.64*Math.sin(phi),0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.64*Math.cos(phi),.0025,6,96]}/><meshBasicMaterial color="#ffffff" transparent opacity={.065}/></mesh>; })}
    <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.65,.0035,8,128]}/><meshBasicMaterial color="#c9a24b" transparent opacity={.32}/></mesh>
  </group>;
}

function LocationMarker({ location, reduced }) {
  const markerRef=useRef(null); const haloRef=useRef(null);
  const position=useMemo(() => latLonToVector3(location.latitude,location.longitude,1.68),[location.latitude,location.longitude]);
  useFrame((state) => { if(!markerRef.current || !haloRef.current) return; const pulse=reduced?1:1+Math.sin(state.clock.elapsedTime*2.1)*.08; markerRef.current.scale.setScalar(pulse); haloRef.current.scale.setScalar(reduced?1.4:1.4+Math.sin(state.clock.elapsedTime*1.4)*.12); });
  return <group position={position}><mesh ref={markerRef}><sphereGeometry args={[.045,18,18]}/><meshBasicMaterial color="#c9a24b"/></mesh><mesh ref={haloRef}><sphereGeometry args={[.09,16,16]}/><meshBasicMaterial color="#c9a24b" transparent opacity={.1}/></mesh></group>;
}

function latLonToVector3(latitude,longitude,radius) { const lat=THREE.MathUtils.degToRad(latitude); const lon=THREE.MathUtils.degToRad(longitude); return new THREE.Vector3(-radius*Math.cos(lat)*Math.cos(lon),radius*Math.sin(lat),radius*Math.cos(lat)*Math.sin(lon)); }
