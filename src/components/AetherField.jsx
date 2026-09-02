import { useEffect, useRef } from "react";
import useReducedMotionPreference from "../hooks/useReducedMotionPreference.js";
import styles from "./AetherField.module.css";

function createRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export default function AetherField({ className = "", density = 1, intensity = 1 }) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let width = 1;
    let height = 1;
    let frameId = null;
    let lastFrame = 0;
    let visible = false;
    let particles = [];
    const pointer = { x: -1000, y: -1000, active: false };

    const buildParticles = () => {
      const random = createRandom(Math.round(width * 17 + height * 31));
      const particleCount = Math.min(92, Math.max(24, Math.round((width * height * density) / 16000)));
      particles = Array.from({ length: particleCount }, () => ({
        x: random() * width,
        y: random() * height,
        radius: 1 + random() * 1.8,
        velocityX: (random() - 0.5) * 0.24,
        velocityY: (random() - 0.5) * 0.24,
      }));
    };

    const draw = (advance = false, frameScale = 1) => {
      context.clearRect(0, 0, width, height);
      const connectionDistance = Math.min(192, Math.max(122, width * 0.15));

      context.shadowBlur = 7;
      context.shadowColor = `rgba(215, 169, 63, ${0.72 * intensity})`;
      particles.forEach((particle) => {
        if (advance) {
          if (pointer.active) {
            const deltaX = pointer.x - particle.x;
            const deltaY = pointer.y - particle.y;
            const distance = Math.hypot(deltaX, deltaY);
            if (distance > 0 && distance < 138) {
              const force = (138 - distance) / 138;
              particle.x -= (deltaX / distance) * force * 1.6 * frameScale;
              particle.y -= (deltaY / distance) * force * 1.6 * frameScale;
            }
          }

          particle.x += particle.velocityX * frameScale;
          particle.y += particle.velocityY * frameScale;
          if (particle.x < 0 || particle.x > width) particle.velocityX *= -1;
          if (particle.y < 0 || particle.y > height) particle.velocityY *= -1;
          particle.x = Math.min(width, Math.max(0, particle.x));
          particle.y = Math.min(height, Math.max(0, particle.y));
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(244, 218, 151, ${0.92 * intensity})`;
        context.fill();
      });
      context.shadowBlur = 0;

      for (let firstIndex = 0; firstIndex < particles.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < particles.length; secondIndex += 1) {
          const first = particles[firstIndex];
          const second = particles[secondIndex];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance >= connectionDistance) continue;

          const pointerDistance = pointer.active
            ? Math.min(Math.hypot(first.x - pointer.x, first.y - pointer.y), Math.hypot(second.x - pointer.x, second.y - pointer.y))
            : Number.POSITIVE_INFINITY;
          const nearPointer = pointerDistance < 150;
          const opacity = (1 - distance / connectionDistance) * 0.54 * intensity;
          context.strokeStyle = nearPointer
            ? `rgba(255, 252, 242, ${opacity * 1.45})`
            : `rgba(222, 174, 68, ${opacity})`;
          context.lineWidth = nearPointer ? 1.5 : 1;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
    };

    const animate = (time) => {
      const frameScale = lastFrame ? Math.min((time - lastFrame) / 16.67, 2) : 1;
      lastFrame = time;
      draw(true, frameScale);
      frameId = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (reducedMotion || !visible || document.hidden || frameId !== null) return;
      lastFrame = 0;
      frameId = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frameId === null) return;
      window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      buildParticles();
      draw(false);
    };

    const handlePointerMove = (event) => {
      if (!visible) {
        pointer.active = false;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const withinField = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      pointer.active = withinField;
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { rootMargin: "120px 0px", threshold: 0.01 });

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resize();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [density, intensity, reducedMotion]);

  return <canvas ref={canvasRef} className={`${styles.field} ${className}`} aria-hidden="true" />;
}
