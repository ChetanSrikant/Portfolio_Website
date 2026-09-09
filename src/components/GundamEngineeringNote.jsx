import styles from "./GundamEngineeringNote.module.css";

export default function GundamEngineeringNote() {
  return (
    <section id="gundam-engineering" className={styles.note} aria-label="Gundam implementation notes">
      <details>
        <summary>Inside the Gundam experience <span>Implementation notes</span></summary>
        <dl>
          <div><dt>Authored animation</dt><dd>The Justice Gundam GLB contains Idle, Saber, Rifle, Shield, Boomerang, and Lifter clips. Three.js animation actions play the rig’s authored clips; the buttons do not generate new poses.</dd></div>
          <div><dt>Scroll mapping</dt><dd>Scroll progress maps to section-specific position, scale, and heading targets. The transition path and Lifter playback are coordinated with the introduction, philosophy, and playground stages.</dd></div>
          <div><dt>Frame-rate-aware movement</dt><dd>React Three Fiber supplies each frame’s delta time. Three.js damping moves the model toward its target position, rotation, and scale instead of using a fixed step per frame.</dd></div>
          <div><dt>Motion preference</dt><dd>Reduced motion removes the automatic flight and scroll-linked Lifter scrub. Explicit playground actions remain available; this is not a promise that every authored clip is motion-free.</dd></div>
          <div><dt>Device handling</dt><dd>The stage loads when it approaches view, pauses rendering offscreen or in a hidden tab, and uses a lower pixel-ratio cap on narrow screens. A WebGL-unavailable message is provided when a canvas cannot be created.</dd></div>
        </dl>
      </details>
    </section>
  );
}
