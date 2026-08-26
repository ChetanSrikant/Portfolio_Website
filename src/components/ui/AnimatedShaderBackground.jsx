import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import useReducedMotionPreference from "../../hooks/useReducedMotionPreference.js";
import styles from "./AnimatedShaderBackground.module.css";

const vertexShader = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uSpeed;

#define NUM_OCTAVES 3
#define FILAMENTS 24

float randomValue(vec2 point) {
  return fract(sin(dot(point, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 point) {
  vec2 integerPoint = floor(point);
  vec2 fraction = fract(point);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);
  float result = mix(
    mix(
      randomValue(integerPoint),
      randomValue(integerPoint + vec2(1.0, 0.0)),
      fraction.x
    ),
    mix(
      randomValue(integerPoint + vec2(0.0, 1.0)),
      randomValue(integerPoint + vec2(1.0, 1.0)),
      fraction.x
    ),
    fraction.y
  );
  return result * result;
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.3;
  vec2 shift = vec2(100.0);
  mat2 rotation = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int octave = 0; octave < NUM_OCTAVES; octave++) {
    value += amplitude * noise(point);
    point = rotation * point * 2.0 + shift;
    amplitude *= 0.4;
  }
  return value;
}

void main() {
  float time = iTime * uSpeed;
  vec2 shake = vec2(sin(time * 1.2), cos(time * 2.1)) * 0.0025;
  vec2 point = (
    (gl_FragCoord.xy + shake * iResolution - iResolution * 0.5) /
    max(iResolution.y, 1.0)
  ) * mat2(6.0, -4.0, 4.0, 6.0);
  vec3 light = vec3(0.0);
  float distortion = 2.0 + fbm(point + vec2(time * 1.15, 0.0)) * 0.5;

  for (int index = 0; index < FILAMENTS; index++) {
    float filament = float(index);
    vec2 vectorField = point + cos(
      filament * filament +
      (time + point.x * 0.08) * 0.025 +
      filament * vec2(13.0, 11.0)
    ) * 3.5;
    vectorField += vec2(
      sin(time * 0.9 + filament),
      cos(time * 1.05 - filament)
    ) * 0.003;

    float tailNoise = fbm(vectorField + vec2(time * 0.18, filament)) *
      0.3 * (1.0 - filament / float(FILAMENTS));
    float distanceToField = max(
      length(vec2(vectorField.x * distortion * 0.015, vectorField.y * 1.5)),
      0.018
    );
    float taper = smoothstep(0.0, 1.0, filament / float(FILAMENTS));
    float contribution = exp(sin(filament * filament + time * 0.36)) /
      distanceToField;
    light += uColor * contribution * (1.0 + tailNoise * 0.8) * taper;
  }

  vec3 mapped = light / (light + vec3(110.0));
  float energy = clamp(max(mapped.r, max(mapped.g, mapped.b)), 0.0, 1.0);
  vec3 warmHighlight = mix(uColor * 0.52, vec3(1.0, 0.92, 0.73), energy);
  float edgeFade = smoothstep(1.25, 0.18, length(
    (gl_FragCoord.xy - iResolution * 0.5) / max(iResolution.y, 1.0)
  ));

  gl_FragColor = vec4(
    warmHighlight * mapped * 1.35,
    energy * edgeFade * uIntensity
  );
}
`;

export default function AnimatedShaderBackground({
  className = "",
  color = "#e0bb63",
  intensity = 0.56,
  speed = 0.55,
}) {
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: reducedMotion ? 4.2 : 0 },
        iResolution: { value: new THREE.Vector2(1, 1) },
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId = 0;
    let inView = false;
    let disposed = false;

    const resize = () => {
      const width = Math.max(1, Math.floor(container.clientWidth));
      const height = Math.max(1, Math.floor(container.clientHeight));
      renderer.setSize(width, height, false);
      const pixelRatio = renderer.getPixelRatio();
      material.uniforms.iResolution.value.set(
        width * pixelRatio,
        height * pixelRatio,
      );
      renderer.render(scene, camera);
    };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const renderFrame = (time) => {
      if (disposed || reducedMotion || !inView || document.hidden) {
        frameId = 0;
        return;
      }
      material.uniforms.iTime.value = time * 0.001;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (!frameId && !reducedMotion && inView && !document.hidden) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { rootMargin: "180px 0px", threshold: 0.01 },
    );
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();

    return () => {
      disposed = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [color, intensity, reducedMotion, speed]);

  return (
    <div
      ref={containerRef}
      className={`${styles.root} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
