// Layer presets for <RainCanvas />. Defined once at module scope so they're
// stable references across renders (RainCanvas re-seeds its drop pool
// whenever this object identity/content changes, so we don't want a fresh
// array literal created inline on every RealApp render).

// Slide 2 — actual rain. Colors pulled from the original rain-bg/mg/fg.svg
// gradients (#cbd5e1 → #dbeafe → #eff6ff), fg layer fastest/thickest/blurred
// to read as "closest to camera", matching the original bg/mg/fg depth idea.
export const RAIN_LAYERS = [
  {
    color: '#cbd5e1',
    count: 55,
    speedMin: 900,
    speedMax: 1300,
    lenMin: 18,
    lenMax: 34,
    width: 1,
    opacityMin: 0.15,
    opacityMax: 0.3,
  },
  {
    color: '#dbeafe',
    count: 40,
    speedMin: 1300,
    speedMax: 1800,
    lenMin: 26,
    lenMax: 48,
    width: 1.6,
    opacityMin: 0.28,
    opacityMax: 0.48,
  },
  {
    color: '#eff6ff',
    count: 26,
    speedMin: 1800,
    speedMax: 2400,
    lenMin: 36,
    lenMax: 70,
    width: 2.2,
    opacityMin: 0.4,
    opacityMax: 0.65,
    blur: 0.6,
  },
]

// Slide 3 — textile depth lines. Original textile-bg/mg/fg.svg used a single
// light-blue (#93c5fd) dashed stroke at increasing weight/opacity per layer;
// mirrored here, kept slow since it's a subtle ambient backdrop, not "rain".
export const TEXTILE_LAYERS = [
  {
    color: '#93c5fd',
    count: 24,
    speedMin: 260,
    speedMax: 360,
    lenMin: 90,
    lenMax: 180,
    width: 1,
    opacityMin: 0.08,
    opacityMax: 0.16,
  },
  {
    color: '#93c5fd',
    count: 18,
    speedMin: 360,
    speedMax: 460,
    lenMin: 120,
    lenMax: 220,
    width: 1.6,
    opacityMin: 0.14,
    opacityMax: 0.24,
  },
  {
    color: '#93c5fd',
    count: 12,
    speedMin: 460,
    speedMax: 580,
    lenMin: 150,
    lenMax: 280,
    width: 2.2,
    opacityMin: 0.2,
    opacityMax: 0.32,
    blur: 1,
  },
]