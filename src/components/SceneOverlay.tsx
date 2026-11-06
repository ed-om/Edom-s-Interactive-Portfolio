import { SKILL_GROUPS } from '../data/story';
import { EYES, MILESTONES, SCENE_H, SCENE_W, STITCH_PATH, TOOL_SLOTS, TRAIL_END, footprints } from '../data/scene';

/**
 * Hand-drawn layer that rides on the avatar (same coordinate box as the artwork), so it zooms and pans with her.
 * Everything starts hidden; StoryExperience reveals each group at its chapter and a blink plays at rest.
 */
export function SceneOverlay() {
  const prints = footprints();
  return (
    <svg className="scene-overlay" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} aria-hidden="true">
      <defs>
        <mask id="stitch-mask" maskUnits="userSpaceOnUse" x="-200" y="0" width="1800" height={SCENE_H}>
          <path className="stitch-reveal" d={STITCH_PATH} pathLength={1} />
        </mask>
      </defs>
      <g className="blink">
        {EYES.map(([x, y]) => (
          <g key={x}><circle cx={x} cy={y} r="19" fill="#7a2a10" /><path d={`M${x - 13} ${y} Q${x} ${y + 9} ${x + 13} ${y}`} stroke="#1a0c07" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
        ))}
      </g>
      <g className="annot-tools">
        {TOOL_SLOTS.map((slot, i) => (
          <g className="annot" key={SKILL_GROUPS[i].name}>
            <path className="annot-line" d={slot.line} pathLength={1} />
            <text x={slot.x} y={slot.y}>
              <tspan className="annot-title">{SKILL_GROUPS[i].name}</tspan>
              <tspan className="annot-sub" x={slot.x} dy="38">{SKILL_GROUPS[i].items.slice(0, 3).join(' · ')}</tspan>
            </text>
          </g>
        ))}
      </g>
      <g className="stitch">
        <path className="stitch-thread" d={STITCH_PATH} mask="url(#stitch-mask)" />
        {MILESTONES.map((m) => (
          <g className="milestone" key={m.label}>
            <circle className="pin" cx={m.at[0]} cy={m.at[1]} r="11" />
            <text x={m.at[0] + 26} y={m.at[1] + 10}>{m.label}</text>
          </g>
        ))}
      </g>
      <g className="trail">
        {prints.map((p) => (
          <g className="print" key={p.key} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.deg.toFixed(1)}) scale(${p.size.toFixed(2)})`}>
            <ellipse rx="15" ry="26" /><ellipse cy="42" rx="11" ry="11" />
          </g>
        ))}
        <text className="print-note" x={TRAIL_END[0]} y={TRAIL_END[1]}>…and then?</text>
      </g>
    </svg>
  );
}

const LEAF = 'M0 0 C40 -60 120 -60 160 0 C120 60 40 60 0 0Z';
const NEAR = [[120, 150, -20, 1.6], [520, 780, 35, 1.2], [980, 120, 160, 1.8], [1380, 640, 200, 1.4], [260, 520, 80, 1], [820, 450, -60, 1.1], [1500, 190, 120, 1.3]];

/** Depth layers behind and in front of the avatar. The camera drives them at different rates (see StoryExperience). */
export function ParallaxLayer({ depth }: { depth: 'far' | 'mid' | 'near' }) {
  return (
    <div className={`parallax parallax--${depth}`} aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        {depth === 'far' && <><ellipse cx="420" cy="300" rx="380" ry="260" fill="#ecc8d6" /><ellipse cx="1180" cy="720" rx="420" ry="280" fill="#d8c7ee" /></>}
        {depth === 'mid' && <>
          <rect x="260" y="640" width="190" height="130" rx="10" fill="#fffaf1" transform="rotate(-9 355 705)" />
          <rect x="1120" y="200" width="150" height="190" rx="10" fill="#fff2cf" transform="rotate(12 1195 295)" />
          <path d="M80 860 C380 760 520 940 820 820 S1300 700 1560 800" fill="none" stroke="#9e84b5" strokeWidth="3" strokeDasharray="4 14" strokeLinecap="round" />
        </>}
        {depth === 'near' && NEAR.map(([x, y, r, s]) => <path key={`${x}-${y}`} d={LEAF} fill="#6f8c78" transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} />)}
      </svg>
    </div>
  );
}
