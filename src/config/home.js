/**
 * Home-page narrative contracts.
 *
 * These values mirror the approved Home implementation plan. Keep navigation
 * targets, panel fades, and stage transforms coordinated when tuning them.
 */
export const HOME_STAGE = Object.freeze({
  wrapperHeightVh: 480,
  sections: Object.freeze({
    intro: Object.freeze([0, 0.19]),
    philosophy: Object.freeze([0.19, 0.41]),
    playground: Object.freeze([0.41, 0.82]),
    contact: Object.freeze([0.82, 1]),
  }),
  panelFades: Object.freeze({
    intro: Object.freeze([0, 0.03, 0.15, 0.19]),
    philosophy: Object.freeze([0.19, 0.23, 0.37, 0.41]),
    playground: Object.freeze([0.41, 0.45, 0.72, 0.76]),
    contact: Object.freeze([0.82, 0.86]),
  }),
});

export const HOME_TARGETS = Object.freeze({
  philosophy: 0.22,
  work: 0.42,
  contact: 0.83,
});

export const HERO_NAV_THRESHOLD = 0.25;

export function getGundamTransform(progress) {
  const p = Math.min(1, Math.max(0, progress));

  let x;
  if (p < 0.08) x = remap(p, 0, 0.08, -5.5, -1.85);
  else if (p < 0.17) x = -1.85;
  else if (p < 0.23) x = remap(p, 0.17, 0.23, -1.85, 1.85);
  else if (p < 0.74) x = 1.85;
  else if (p < 0.82) x = remap(p, 0.74, 0.82, 1.85, -2.2);
  else x = -2.4;

  let scale;
  if (p < 0.08) scale = remap(p, 0, 0.08, 1.02, 1.3);
  else if (p < 0.74) scale = 1.3;
  else if (p < 0.82) scale = remap(p, 0.74, 0.82, 1.3, 1);
  else scale = 1;

  return {
    x,
    scale,
    rotationY: -p * Math.PI * 0.46,
  };
}

export function getStageLabel(progress) {
  if (progress < HOME_STAGE.sections.intro[1]) return "INTRO";
  if (progress < HOME_STAGE.sections.philosophy[1]) return "PHILOSOPHY";
  if (progress < HOME_STAGE.sections.playground[1]) return "PLAYGROUND";
  return "CONTACT";
}

export function scrollToStageProgress(fraction) {
  const wrapper = document.getElementById("gundam-wrapper");
  if (!wrapper) return;

  const clampedFraction = Math.min(1, Math.max(0, fraction));
  const total = wrapper.offsetHeight - window.innerHeight;
  const target = wrapper.offsetTop + total * clampedFraction;
  window.scrollTo({ top: target, behavior: "smooth" });
}

function remap(value, inMin, inMax, outMin, outMax) {
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
