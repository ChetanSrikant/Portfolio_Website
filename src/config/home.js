/**
 * Home-page narrative and Gundam choreography contracts.
 *
 * Progress is normalized across the single sticky Gundam wrapper. Keep stage
 * ranges, transform keyframes, HUD labels, and navigation targets coordinated.
 */

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
    key: HOME_STAGE_KEYS.PHILOSOPHY,
    label: "PHILOSOPHY",
    start: 0.105,
    end: 0.225,
  }),
  Object.freeze({ key: HOME_STAGE_KEYS.SKILLS, label: "SKILLS", start: 0.225, end: 0.315 }),
  Object.freeze({
    key: HOME_STAGE_KEYS.CREATIVE,
    label: "CREATIVE",
    start: 0.315,
    end: 0.405,
  }),
  Object.freeze({
    key: HOME_STAGE_KEYS.PROJECTS,
    label: "PROJECTS",
    start: 0.405,
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
    philosophy: Object.freeze([0.105, 0.12, 0.205, 0.225]),
    playground: Object.freeze([0.895, 0.91, 1.01, 1.02]),
  }),
});

export const HOME_CHOREOGRAPHY = Object.freeze({
  flightBoundaryIndexes: Object.freeze([1]),
  stageHysteresis: 0.006,
  flightCooldownMs: 1400,
});

export const HOME_TARGETS = Object.freeze({
  philosophy: 0.15,
  skills: 0.27,
  creative: 0.36,
  work: 0.48,
  experience: 0.82,
  contact: 0.865,
  playground: 0.955,
});

const GUNDAM_KEYFRAMES = Object.freeze([
  frame(0, -1.88, 0, 0, 1.3, 11, 1, 0.52),
  frame(0.105, -1.88, 0, 0, 1.3, 11, 1, 0.52),

  frame(0.12, -1.6, 0.2, 0, 1.12, 18, 0.95, 0.35),
  frame(0.15, 1.9, 0.22, 0, 1, 34, 0.86, 0.3),
  frame(0.225, 2.15, 0.04, 0, 1.02, 28, 0.82, 0.42),

  frame(0.27, 2.25, 0.08, 0, 0.78, 22, 0.72, 0.25),
  frame(0.315, 2.25, 0.1, 0, 0.76, 22, 0.72, 0.24),

  frame(0.335, 2.05, 0.36, 0, 0.78, 38, 0.82, 0.2),
  frame(0.37, 0.6, 0.5, 0, 0.86, 52, 1, 0.16),
  frame(0.405, -0.15, 0.34, 0, 0.82, 44, 0.9, 0.2),

  frame(0.445, 2.55, 0.15, 0, 0.68, 18, 0.68, 0.18),
  frame(0.7, 2.45, 0.1, 0, 0.64, 16, 0.62, 0.18),
  frame(0.745, 2.35, 0.28, 0, 0.72, 22, 0.68, 0.2),

  frame(0.82, 2.1, 0.18, 0, 0.9, 36, 0.72, 0.28),
  frame(0.89, 1.82, 0.08, 0, 1.08, 48, 0.9, 0.42),

  frame(0.91, 1.74, 0.02, 0, 1.12, 53, 1, 0.58),
  frame(0.935, 1.7, 0, 0, 1.18, 53, 1, 0.62),
  frame(1, 1.7, 0, 0, 1.18, 53, 1, 0.62),
]);

const REDUCED_MOTION_TRANSFORMS = Object.freeze({
  intro: frame(0, -1.88, 0, 0, 1.3, 11, 1, 0.52),
  philosophy: frame(0, 2.15, 0.06, 0, 1.08, 28, 0.78, 0.42),
  skills: frame(0, 2.25, 0.08, 0, 0.78, 22, 0.6, 0.25),
  creative: frame(0, 0.6, 0.5, 0, 0.92, 48, 0.8, 0.18),
  projects: frame(0, 2.5, 0.12, 0, 0.66, 17, 0.52, 0.18),
  experience: frame(0, 2.05, 0.12, 0, 0.96, 40, 0.78, 0.34),
  playground: frame(0, 1.7, 0, 0, 1.18, 53, 1, 0.62),
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

function adaptTransformForViewport(transform, stageKey, viewportWidth) {
  if (!Number.isFinite(viewportWidth)) {
    return { ...transform, scale: transform.scale * 1.12 };
  }

  if (viewportWidth <= 720) {
    const playground = stageKey === HOME_STAGE_KEYS.PLAYGROUND;
    return {
      ...transform,
      x: playground
        ? 0
        : Math.min(0.3, Math.max(-0.3, transform.x * 0.12)),
      y: transform.y + (playground ? 0.92 : 0.78),
      scale: transform.scale * (playground ? 0.59 : 0.61),
    };
  }

  if (viewportWidth <= 1040) {
    return {
      ...transform,
      x: transform.x * 0.72,
      y: transform.y + 0.04,
      scale: transform.scale * 0.93,
    };
  }

  return { ...transform, scale: transform.scale * 1.12 };
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
