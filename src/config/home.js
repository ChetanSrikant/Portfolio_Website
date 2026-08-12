/**
 * Home-page narrative contracts.
 *
 * These values mirror the approved Home implementation plan. Keep navigation
 * targets, panel fades, and stage transforms coordinated when tuning them.
 */
export const HOME_STAGE = Object.freeze({
  sections: Object.freeze({
    intro: Object.freeze([0, 0.1]),
    philosophy: Object.freeze([0.1, 0.21]),
    contact: Object.freeze([0.21, 0.31]),
    journey: Object.freeze([0.31, 0.91]),
    playground: Object.freeze([0.91, 1]),
  }),
  panelFades: Object.freeze({
    intro: Object.freeze([0, 0.015, 0.08, 0.1]),
    philosophy: Object.freeze([0.1, 0.115, 0.19, 0.21]),
    contact: Object.freeze([0.21, 0.23, 0.29, 0.31]),
    playground: Object.freeze([0.91, 0.935, 1.01, 1.02]),
  }),
});

export const HOME_TARGETS = Object.freeze({
  philosophy: 0.13,
  work: 0.51,
  contact: 0.24,
  playground: 0.975,
});

export const HERO_NAV_THRESHOLD = 0.25;

export function getGundamTransform(progress) {
  const p = Math.min(1, Math.max(0, progress));

  let x;
  if (p < 0.08) x = remap(p, 0, 0.08, -5.5, -1.85);
  else if (p < 0.11) x = -1.85;
  else if (p < 0.15) x = remap(p, 0.11, 0.15, -1.85, 1.85);
  else if (p < 0.24) x = 1.85;
  else if (p < 0.42) x = remap(p, 0.24, 0.42, 1.85, -2.35);
  else if (p < 0.58) x = remap(p, 0.42, 0.58, -2.35, 2.3);
  else if (p < 0.72) x = remap(p, 0.58, 0.72, 2.3, -2.2);
  else if (p < 0.92) x = remap(p, 0.72, 0.92, -2.2, 1.85);
  else x = 1.85;

  let scale;
  if (p < 0.08) scale = remap(p, 0, 0.08, 1.02, 1.3);
  else if (p < 0.2) scale = 1.3;
  else if (p < 0.26) scale = remap(p, 0.2, 0.26, 1.3, 0.72);
  else if (p < 0.89) scale = 0.72;
  else if (p < 0.94) scale = remap(p, 0.89, 0.94, 0.72, 1.3);
  else scale = 1.3;

  const rotationY =
    p < 0.88
      ? -p * Math.PI * 0.9
      : remap(p, 0.88, 0.94, -0.88 * Math.PI * 0.9, -Math.PI * 0.295);

  return {
    x,
    scale,
    rotationY,
  };
}

export function getStageLabel(progress) {
  if (progress < HOME_STAGE.sections.intro[1]) return "INTRO";
  if (progress < HOME_STAGE.sections.philosophy[1]) return "PHILOSOPHY";
  if (progress < HOME_STAGE.sections.contact[1]) return "CONTACT";
  if (progress < HOME_STAGE.sections.playground[0]) return "JOURNEY";
  return "PLAYGROUND";
}

export function scrollToStageProgress(fraction) {
  const wrapper = document.getElementById("gundam-wrapper");
  if (!wrapper) return;

  const clampedFraction = Math.min(1, Math.max(0, fraction));
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

function remap(value, inMin, inMax, outMin, outMax) {
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
