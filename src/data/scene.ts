/** Scene coordinates for the overlay that rides on the avatar. Units match the avatar image box (1204 x 1771). */
export const SCENE_W = 1204;
export const SCENE_H = 1771;
const pt = (fx: number, fy: number): [number, number] => [Math.round(fx * SCENE_W), Math.round(fy * SCENE_H)];

/** Where each toolkit label sits around the raised hand, and the leader line that points back to it. */
export const TOOL_SLOTS = [
  { x: -90, y: 520, line: 'M150 536 C190 560 190 600 178 640' },
  { x: 215, y: 500, line: 'M290 520 C300 560 270 600 246 636' },
  { x: -105, y: 690, line: 'M92 674 C120 667 146 651 170 628' },
  { x: -120, y: 840, line: 'M96 806 C110 780 130 752 150 726' },
  { x: 250, y: 850, line: 'M310 812 C312 780 296 752 268 728' },
] as const;

/** A stitched thread down the left trouser leg, with a pinned note for each stage of the journey. */
const s0 = pt(0.40, 0.655), s1 = pt(0.34, 0.76), s2 = pt(0.30, 0.82), s3 = pt(0.265, 0.915), s4 = pt(0.265, 0.915);
export const STITCH_PATH = `M${s0} C${pt(0.38, 0.71)} ${pt(0.35, 0.735)} ${s1} S${pt(0.31, 0.79)} ${s2} S${pt(0.27, 0.88)} ${s3}{pt(0.27, 0.88)}${s4}`;
export const MILESTONES = [
  { label: 'AASTU', at: pt(0.39, 0.685) },
  { label: 'INSA Summer Camp', at: pt(0.335, 0.775) },
  { label: 'GDG DSA', at: pt(0.285, 0.875) },
  { label: 'AWS SBG Cloud & DevOps', at: pt(0.285, 0.875) },
] as const;

/** Eye positions for the occasional blink. Verify against the artwork if the crop changes. */
export const EYES = [pt(0.55, 0.277), pt(0.647, 0.277)] as const;

/** Footprints stepping away from the sneakers along a bezier that leaves the drawing. */
export function footprints(count = 8) {
  const p0 = pt(0.80, 0.955), c1 = pt(0.97, 0.99), c2 = pt(1.12, 0.87), p3 = pt(1.42, 0.9);
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count, u = 1 - t;
    const x = u ** 3 * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t ** 3 * p3[0];
    const y = u ** 3 * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t ** 3 * p3[1];
    const dx = 3 * u * u * (c1[0] - p0[0]) + 6 * u * t * (c2[0] - c1[0]) + 3 * t * t * (p3[0] - c2[0]);
    const dy = 3 * u * u * (c1[1] - p0[1]) + 6 * u * t * (c2[1] - c1[1]) + 3 * t * t * (p3[1] - c2[1]);
    const len = Math.hypot(dx, dy), side = i % 2 ? 1 : -1;
    return { key: i, x: x - (dy / len) * side * 24, y: y + (dx / len) * side * 24, deg: (Math.atan2(dy, dx) * 180) / Math.PI - 90, size: 1 - t * 0.25 };
  });
}
export const TRAIL_END = pt(1.36, 0.86);
