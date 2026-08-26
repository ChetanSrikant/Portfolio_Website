import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference.js";
import styles from "./GridBloom.module.css";

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uGridScale;
uniform float uRotationSpeed;
uniform float uFadeFalloff;
uniform float uDistortionAmount;
uniform float uFlowSpeedX;
uniform float uFlowSpeedY;
uniform float uHoverRepulsionRadius;
uniform float uHoverRepulsionStrength;
uniform float uHoverLightRadius;
uniform float uMouseActive;
uniform vec2 iMouse;
varying vec2 vUv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 10.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) +
    i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.792843 - 0.853735 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 unrotatedP = (fragCoord - 0.5 * iResolution) / iResolution.y;
  vec2 mouseP = (iMouse - 0.5 * iResolution) / iResolution.y;
  vec2 mouseDir = unrotatedP - mouseP;
  float mouseDist = length(mouseDir);
  float mouseInfluence = smoothstep(
    uHoverRepulsionRadius,
    0.0,
    mouseDist
  ) * uMouseActive;

  float rotation = iTime * uRotationSpeed * 0.3;
  mat2 rotationMatrix = mat2(
    cos(rotation),
    -sin(rotation),
    sin(rotation),
    cos(rotation)
  );
  vec2 p = rotationMatrix * unrotatedP;
  float noiseDist = snoise(p * 1.5 + iTime * uSpeed * 0.15);
  vec2 distortedPosition = p + vec2(noiseDist * uDistortionAmount);
  distortedPosition += rotationMatrix * mouseDir * mouseInfluence * uHoverRepulsionStrength;

  vec2 gridPosition = distortedPosition * uGridScale;
  gridPosition.x += iTime * uSpeed * uFlowSpeedX;
  gridPosition.y += iTime * uSpeed * uFlowSpeedY;

  vec2 cellCenter = abs(fract(gridPosition) - 0.5);
  float lineWidth = 0.015;
  float smoothEdge = 0.03;
  vec2 lines = smoothstep(
    0.5 - lineWidth - smoothEdge,
    0.5 - lineWidth,
    cellCenter
  );
  float gridAlpha = max(lines.x, lines.y);
  float intersections = lines.x * lines.y;
  float glowMask = snoise(floor(gridPosition) * 0.4 + iTime * uSpeed * 0.4);
  float glow = smoothstep(0.2, 0.5, cellCenter.x) *
    smoothstep(0.2, 0.5, cellCenter.y) *
    smoothstep(0.3, 0.8, glowMask);
  float pulseDistance = length(p);
  float pulse = 0.5 + 0.5 * sin(
    pulseDistance * 8.0 - iTime * uSpeed * 1.5 + noiseDist * 2.0
  );

  float finalAlpha = gridAlpha * 0.3 + intersections * 0.8 + glow * 0.6;
  finalAlpha *= 0.6 + 0.4 * snoise(p * 4.0 - iTime * uSpeed * 0.5);
  finalAlpha += finalAlpha * pulse * 0.4;
  float mouseGlow = smoothstep(uHoverLightRadius, 0.0, mouseDist) *
    0.6 * uMouseActive;
  finalAlpha += mouseGlow * gridAlpha;
  float vignette = 1.0 - smoothstep(0.1, uFadeFalloff, pulseDistance);
  float breathing = 0.8 + 0.2 * sin(iTime * uSpeed * 0.8);

  fragColor = vec4(
    uColor,
    clamp(finalAlpha * vignette * breathing, 0.0, 1.0)
  );
}

void main() {
  mainImage(gl_FragColor, vUv * iResolution);
}
`;

function ShaderPlane({
  active,
  color,
  speed,
  gridScale,
  rotationSpeed,
  fadeFalloff,
  distortionAmount,
  flowSpeedX,
  flowSpeedY,
  hoverLightRadius,
  hoverRepulsionRadius,
  hoverRepulsionStrength,
  enableMouseInteraction,
  reducedMotion,
}) {
  const materialRef = useRef(null);
  const gl = useThree((state) => state.gl);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: 0,
    targetActive: 0,
  });

  const uniforms = useMemo(() => ({
    iTime: { value: reducedMotion ? 3.4 : 0 },
    iResolution: { value: new THREE.Vector2(1, 1) },
    iMouse: { value: new THREE.Vector2(-1000, -1000) },
    uMouseActive: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uSpeed: { value: speed },
    uGridScale: { value: gridScale },
    uRotationSpeed: { value: rotationSpeed },
    uFadeFalloff: { value: fadeFalloff },
    uDistortionAmount: { value: distortionAmount },
    uFlowSpeedX: { value: flowSpeedX },
    uFlowSpeedY: { value: flowSpeedY },
    uHoverLightRadius: { value: hoverLightRadius },
    uHoverRepulsionRadius: { value: hoverRepulsionRadius },
    uHoverRepulsionStrength: { value: hoverRepulsionStrength },
  }), []);

  useEffect(() => {
    uniforms.uColor.value.set(color);
    uniforms.uSpeed.value = speed;
    uniforms.uGridScale.value = gridScale;
    uniforms.uRotationSpeed.value = rotationSpeed;
    uniforms.uFadeFalloff.value = fadeFalloff;
    uniforms.uDistortionAmount.value = distortionAmount;
    uniforms.uFlowSpeedX.value = flowSpeedX;
    uniforms.uFlowSpeedY.value = flowSpeedY;
    uniforms.uHoverLightRadius.value = hoverLightRadius;
    uniforms.uHoverRepulsionRadius.value = hoverRepulsionRadius;
    uniforms.uHoverRepulsionStrength.value = hoverRepulsionStrength;
  }, [
    color,
    distortionAmount,
    fadeFalloff,
    flowSpeedX,
    flowSpeedY,
    gridScale,
    hoverLightRadius,
    hoverRepulsionRadius,
    hoverRepulsionStrength,
    rotationSpeed,
    speed,
    uniforms,
  ]);

  useEffect(() => {
    if (!enableMouseInteraction || reducedMotion) {
      mouseRef.current.targetActive = 0;
      mouseRef.current.active = 0;
      return undefined;
    }

    const handlePointerMove = (event) => {
      const bounds = gl.domElement.getBoundingClientRect();
      const inside = event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      mouseRef.current.targetActive = inside ? 1 : 0;
      if (inside) {
        mouseRef.current.targetX = event.clientX - bounds.left;
        mouseRef.current.targetY = bounds.bottom - event.clientY;
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetActive = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [enableMouseInteraction, gl.domElement, reducedMotion]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;

    const pixelRatio = state.gl.getPixelRatio();
    material.uniforms.iResolution.value.set(
      state.size.width * pixelRatio,
      state.size.height * pixelRatio,
    );

    if (reducedMotion || !active) return;

    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
    mouseRef.current.active +=
      (mouseRef.current.targetActive - mouseRef.current.active) * 0.15;

    material.uniforms.iTime.value = state.clock.elapsedTime;
    material.uniforms.iMouse.value.set(
      mouseRef.current.x * pixelRatio,
      mouseRef.current.y * pixelRatio,
    );
    material.uniforms.uMouseActive.value = mouseRef.current.active;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function GridBloom({
  className = "",
  color = "#e0bb63",
  speed = 0.55,
  gridScale = 11,
  rotationSpeed = 0.025,
  fadeFalloff = 1.05,
  distortionAmount = 0.035,
  flowSpeedX = -0.12,
  flowSpeedY = -0.22,
  hoverLightRadius = 0.42,
  hoverRepulsionRadius = 0.7,
  hoverRepulsionStrength = 0.28,
  enableMouseInteraction = true,
}) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "180px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.root} ${className}`.trim()}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        frameloop={visible && !reducedMotion ? "always" : "demand"}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ShaderPlane
          active={visible}
          color={color}
          speed={speed}
          gridScale={gridScale}
          rotationSpeed={rotationSpeed}
          fadeFalloff={fadeFalloff}
          distortionAmount={distortionAmount}
          flowSpeedX={flowSpeedX}
          flowSpeedY={flowSpeedY}
          hoverLightRadius={hoverLightRadius}
          hoverRepulsionRadius={hoverRepulsionRadius}
          hoverRepulsionStrength={hoverRepulsionStrength}
          enableMouseInteraction={enableMouseInteraction}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
