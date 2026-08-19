/**
 * Home-page narrative and Gundam choreography contracts.
 *
 * Progress is normalized across the single sticky Gundam wrapper. Keep stage
 * ranges, transform keyframes, HUD labels, and navigation targets coordinated.
 */
import * as THREE from "three";

export const INTRO_HEADING_DEG = 11;
export const HERO_NAV_THRESHOLD = 0.25;

export const HOME_STAGE_KEYS = Object.freeze({
  INTRO: "intro",
  PHILOSOPHY: "philosophy",
  SKILLS: "skills",
  CREATIVE: "creative",
  PROJECTS: "projects",
  EXPERIENCE: "experience",
  PLAYGROUND: "playground",
});

export const HOME_STAGES = Object.freeze([
  Object.freeze({ key: HOME_STAGE_KEYS.INTRO, label: "INTRO", start: 0, end: 0.105 }),
  Object.freeze({
    key: HOME_STAGE_KEYS.SKILLS,
    label: "SKILLS",
    start: 0.105,
    end: 0.215,
  }),
  Object.freeze({
    key: HOME_STAGE_KEYS.CREATIVE,
    label: "CREATIVE",
    start: 0.215,
    end: 0.295,
  }),
  Object.freeze({
    key: HOME_STAGE_KEYS.PHILOSOPHY,
    label: "PHILOSOPHY",
    start: 0.295,
    end: 0.38,
  }),
  Object.freeze({
    key: HOME_STAGE_KEYS.PROJECTS,
    label: "PROJECTS",
    start: 0.38,
    end: 0.745,
  }),
  Object.freeze({
    key: HOME_STAGE_KEYS.EXPERIENCE,
    label: "EXPERIENCE",
    start: 0.745,
    end: 0.9,
  }),
  Object.freeze({
    key: HOME_STAGE_KEYS.PLAYGROUND,
    label: "PLAYGROUND",
    start: 0.9,
    end: 1,
  }),
]);

export const HOME_STAGE = Object.freeze({
  sections: Object.freeze(
    Object.fromEntries(HOME_STAGES.map((stage) => [stage.key, Object.freeze([stage.start, stage.end])]))
  ),
  panelFades: Object.freeze({
    intro: Object.freeze([0, 0.008, 0.085, 0.105]),
    skillsBackdrop: Object.freeze([0.105, 0.125, 0.195, 0.215]),
    playground: Object.freeze([0.895, 0.91, 1.01, 1.02]),
  }),
});

export const HOME_CHOREOGRAPHY = Object.freeze({
  stageHysteresis: 0.006,
  introToPhilosophy: Object.freeze({
    start: HOME_STAGE.panelFades.intro[2],
    landingSelector: "#philosophy",
    landingHold: 0.14,
  }),
});

export const HOME_TARGETS = Object.freeze({
  philosophy: 0.335,
  skills: 0.189,
  creative: 0.244,
  work: 0.43,
  experience: 0.803,
  contact: 0.865,
  playground: 0.955,
});

const PHILOSOPHY_LANDING_TRANSFORM = frame(
  HOME_TARGETS.philosophy,
  2.65,
  0.04,
  0,
  1.02,
  28,
  0.82,
  0.42
);

const GUNDAM_KEYFRAMES = Object.freeze([
  frame(0, -1.88, 0, 0, 1.3, 11, 1, 0.52),
  frame(0.105, -1.88, 0, 0, 1.3, 11, 1, 0.52),

  frame(0.189, 2.25, 0.08, 0, 0.78, 22, 0.72, 0.25),
  frame(0.215, 2.25, 0.1, 0, 0.76, 22, 0.72, 0.24),

  frame(0.235, 2.05, 0.36, 0, 0.78, 38, 0.82, 0.2),
  frame(0.265, 0.6, 0.5, 0, 0.86, 52, 1, 0.16),
  frame(0.295, -0.15, 0.34, 0, 0.82, 44, 0.9, 0.2),

  PHILOSOPHY_LANDING_TRANSFORM,
  frame(0.38, 2.65, 0.04, 0, 1.02, 28, 0.82, 0.42),

  // Philosophy -> Playground: leave from the right, sweep left, then
  // return to the same x/y landing point. Alternating y values create a
  // restrained hover arc while the authored Lifter clip is scroll-scrubbed.
  frame(0.43, 1.2, 0.28, -0.04, 0.78, 12, 0.72, 0.2),
  frame(0.54, 0.05, 0.46, -0.08, 0.7, -4, 0.66, 0.18),
  frame(0.64, -1.45, 0.22, -0.06, 0.66, -20, 0.64, 0.18),
  frame(0.7, -1.75, 0.36, -0.04, 0.66, -24, 0.64, 0.18),
  frame(0.745, -1.2, 0.18, -0.02, 0.74, -8, 0.7, 0.22),

  frame(0.82, 0.1, 0.42, -0.06, 0.9, 18, 0.76, 0.3),
  frame(0.89, 1.25, 0.2, -0.03, 1.08, 42, 0.9, 0.44),

  frame(0.91, 1.7, 0.34, -0.02, 1.12, 49, 1, 0.56),
  frame(0.935, 2.03, 0.14, -0.01, 1.17, 52, 1, 0.6),
  frame(HOME_TARGETS.playground, 2.15, 0.04, 0, 1.18, 53, 1, 0.62),
  frame(1, 2.15, 0.04, 0, 1.18, 53, 1, 0.62),
]);

const REDUCED_MOTION_TRANSFORMS = Object.freeze({
  intro: frame(0, -1.88, 0, 0, 1.3, 11, 1, 0.52),
  philosophy: frame(0, 2.65, 0.06, 0, 1.08, 28, 0.78, 0.42),
  skills: frame(0, 2.25, 0.08, 0, 0.78, 22, 0.6, 0.25),
  creative: frame(0, 0.6, 0.5, 0, 0.92, 48, 0.8, 0.18),
  projects: frame(0, 2.5, 0.12, 0, 0.66, 17, 0.52, 0.18),
  experience: frame(0, 2.05, 0.12, 0, 0.96, 40, 0.78, 0.34),
  playground: frame(0, 2.15, 0.04, 0, 1.18, 53, 1, 0.62),
});

export function getHomeStageIndex(progress, previousIndex = null) {
  const p = clamp01(progress);

  if (Number.isInteger(previousIndex) && HOME_STAGES[previousIndex]) {
    const previous = HOME_STAGES[previousIndex];
    const margin = HOME_CHOREOGRAPHY.stageHysteresis;
    if (p >= previous.start - margin && p <= previous.end + margin) {
      return previousIndex;
    }
  }

  const index = HOME_STAGES.findIndex(
    (stage, stageIndex) =>
      p >= stage.start &&
      (p < stage.end || stageIndex === HOME_STAGES.length - 1)
  );
  return index === -1 ? HOME_STAGES.length - 1 : index;
}

export function getHomeStage(progress, previousIndex = null) {
  return HOME_STAGES[getHomeStageIndex(progress, previousIndex)];
}

export function getGundamTransform(
  progress,
  { reducedMotion = false, viewportWidth = null } = {}
) {
  const p = clamp01(progress);
  const stage = getHomeStage(p);

  if (reducedMotion) {
    return adaptTransformForViewport(
      { ...REDUCED_MOTION_TRANSFORMS[stage.key] },
      stage.key,
      viewportWidth
    );
  }

  const upperIndex = GUNDAM_KEYFRAMES.findIndex((keyframe) => keyframe.progress >= p);
  if (upperIndex <= 0) {
    return adaptTransformForViewport(
      { ...GUNDAM_KEYFRAMES[0] },
      stage.key,
      viewportWidth
    );
  }
  if (upperIndex === -1) {
    return adaptTransformForViewport(
      { ...GUNDAM_KEYFRAMES[GUNDAM_KEYFRAMES.length - 1] },
      stage.key,
      viewportWidth
    );
  }

  const from = GUNDAM_KEYFRAMES[upperIndex - 1];
  const to = GUNDAM_KEYFRAMES[upperIndex];
  const rawT = (p - from.progress) / (to.progress - from.progress);
  const t = smoothStep(rawT);

  return adaptTransformForViewport({
    progress: p,
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    z: lerp(from.z, to.z, t),
    scale: lerp(from.scale, to.scale, t),
    rotationY: lerp(from.rotationY, to.rotationY, t),
    opacity: lerp(from.opacity, to.opacity, t),
    shadowOpacity: lerp(from.shadowOpacity, to.shadowOpacity, t),
  }, stage.key, viewportWidth);
}

export function getIntroToPhilosophyTransform(
  transitionProgress,
  { reducedMotion = false, viewportWidth = null } = {}
) {
  const t = clamp01(transitionProgress);
  const intro = GUNDAM_KEYFRAMES[1];
  const philosophy = PHILOSOPHY_LANDING_TRANSFORM;
  const path = createIntroToPhilosophyPath(viewportWidth);
  const current = path.getPointAt(t);
  const lookAhead = path.getPointAt(Math.min(t + 0.018, 1));
  const lookBehind = path.getPointAt(Math.max(t - 0.018, 0));
  const direction = lookAhead.clone().sub(current).normalize();
  const beforeDirection = current.clone().sub(lookBehind).normalize();
  const bend = beforeDirection.x * direction.y - beforeDirection.y * direction.x;
  const stabilization = endpointFade(t, 0.1, 0.84);
  const baseHeading = lerp(intro.rotationY, philosophy.rotationY, smoothStep(t));
  const travelHeading = Math.atan2(direction.x, Math.max(0.35, Math.abs(direction.y))) * 0.16;
  const pathHeading = baseHeading - travelHeading * stabilization;
  const bankLimit = degreesToRadians(viewportWidth <= 720 ? 5 : viewportWidth <= 1040 ? 7 : 9);
  const bank = reducedMotion
    ? 0
    : THREE.MathUtils.clamp(-bend * 2.6, -bankLimit, bankLimit) * stabilization;
  const recede = reducedMotion ? 0 : Math.sin(t * Math.PI) * 0.045;

  return adaptTransformForViewport(
    {
      progress: t,
      x: current.x,
      y: current.y,
      z: current.z,
      scale: lerp(intro.scale, philosophy.scale, smoothStep(t)) - recede,
      rotationY: t <= 0 ? intro.rotationY : t >= 1 ? philosophy.rotationY : pathHeading,
      rotationZ: t <= 0 || t >= 1 ? 0 : bank,
      opacity: lerp(intro.opacity, philosophy.opacity, smoothStep(t)),
      shadowOpacity: lerp(
        intro.shadowOpacity,
        philosophy.shadowOpacity,
        smoothStep(t)
      ),
    },
    HOME_STAGE_KEYS.PHILOSOPHY,
    viewportWidth
  );
}

export function getIntroToPhilosophyPathPoints(viewportWidth, divisions = 64) {
  return createIntroToPhilosophyPath(viewportWidth)
    .getPoints(divisions)
    .map((point) => {
      const adapted = adaptTransformForViewport(
        { x: point.x, y: point.y, z: point.z, scale: 1 },
        HOME_STAGE_KEYS.PHILOSOPHY,
        viewportWidth
      );
      return new THREE.Vector3(adapted.x, adapted.y, adapted.z);
    });
}

export function getStageLabel(progress) {
  return getHomeStage(progress).label;
}

export function scrollToStageProgress(fraction) {
  const wrapper = document.getElementById("gundam-wrapper");
  if (!wrapper) return;

  const clampedFraction = clamp01(fraction);
  const total = wrapper.offsetHeight - window.innerHeight;
  const target = wrapper.offsetTop + total * clampedFraction;
  window.scrollTo({ top: target, behavior: "smooth" });
}

export function scrollToFinalPlayground() {
  const wrapper = document.getElementById("gundam-wrapper");
  if (!wrapper) return;

  const total = wrapper.offsetHeight - window.innerHeight;
  window.scrollTo({
    top: wrapper.offsetTop + total * HOME_TARGETS.playground,
    behavior: "auto",
  });
}

function frame(progress, x, y, z, scale, headingDeg, opacity, shadowOpacity) {
  return Object.freeze({
    progress,
    x,
    y,
    z,
    scale,
    rotationY: degreesToRadians(-headingDeg),
    opacity,
    shadowOpacity,
  });
}

const introToPhilosophyPathCache = new Map();

function createIntroToPhilosophyPath(viewportWidth) {
  const desktop = !Number.isFinite(viewportWidth) || viewportWidth > 1040;
  const mobile = Number.isFinite(viewportWidth) && viewportWidth <= 720;
  const cacheKey = mobile ? "mobile" : desktop ? "desktop" : "tablet";
  const cached = introToPhilosophyPathCache.get(cacheKey);
  if (cached) return cached;

  const points = mobile
    ? [
        [-1.88, 0, 0],
        [-1.46, 0.13, -0.02],
        [-0.88, 0.26, -0.05],
        [-0.2, 0.32, -0.07],
        [0.52, 0.22, -0.05],
        [1.35, 0.12, -0.02],
        [2.65, 0.04, 0],
      ]
    : desktop
      ? [
          [-1.88, 0, 0],
          [-1.58, 0.26, -0.04],
          [-0.92, 0.56, -0.12],
          [-0.08, 0.7, -0.18],
          [0.72, 0.48, -0.15],
          [1.22, 0.66, -0.1],
          [1.68, 0.36, -0.05],
          [2.65, 0.04, 0],
        ]
      : [
          [-1.88, 0, 0],
          [-1.52, 0.2, -0.03],
          [-0.86, 0.43, -0.09],
          [-0.06, 0.52, -0.13],
          [0.68, 0.36, -0.1],
          [1.34, 0.44, -0.06],
          [2.65, 0.04, 0],
        ];

  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal",
    0.42
  );
  introToPhilosophyPathCache.set(cacheKey, curve);
  return curve;
}

function endpointFade(progress, fadeInEnd, fadeOutStart) {
  const inWeight = smoothStep(progress / fadeInEnd);
  const outWeight = 1 - smoothStep((progress - fadeOutStart) / (1 - fadeOutStart));
  return Math.min(inWeight, outWeight);
}

function adaptTransformForViewport(transform, stageKey, viewportWidth) {
  if (!Number.isFinite(viewportWidth)) {
    return { ...transform, scale: transform.scale * 1.28 };
  }

  if (viewportWidth <= 720) {
    const playground = stageKey === HOME_STAGE_KEYS.PLAYGROUND;
    return {
      ...transform,
      x: Math.min(0.3, Math.max(-0.3, transform.x * 0.12)),
      y: transform.y + 0.78,
      scale: transform.scale * (playground ? 0.66 : 0.69),
    };
  }

  if (viewportWidth <= 1040) {
    return {
      ...transform,
      x: transform.x * 0.72,
      y: transform.y + 0.04,
      scale: transform.scale * 1.06,
    };
  }

  return { ...transform, scale: transform.scale * 1.28 };
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function smoothStep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}
