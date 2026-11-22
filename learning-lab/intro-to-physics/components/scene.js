// Introduction to Physics: the pictures. All SVG, drawn from data; every
// picture has a text alternative, and every clickable spot is an HTML
// button laid over the picture (so it works with a keyboard and a screen
// reader, and is big enough to tap).

import { svg } from '../../lesson-kit/dom.js';
import { riderSide, arrow } from '../../lesson-kit/draw.js';
import { STAGES } from '../logic/lesson.js';

// ---------- Find the Physics: the trail scene (1000 × 560) ----------
// The hotspot positions in logic/lesson.js (HOTSPOTS, as % of 1000 × 560)
// match this drawing: rider s = 230 standing at (380, 480).
export function trailScene() {
  const n = svg('svg', { viewBox: '0 0 1000 560', class: 'ls-scene-svg', role: 'img' });
  n.append(svg('title', null, 'A mountain biker on a trail: a snowy peak behind, the trail winding down through a berm to a jump, and the rider and bike up close in front.'),
    svg('defs', null, svg('linearGradient', { id: 'ip-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, svg('stop', { offset: '0', 'stop-color': '#1C2A2E' }), svg('stop', { offset: '1', 'stop-color': '#16201A' }))),
    svg('rect', { x: 0, y: 0, width: 1000, height: 560, fill: 'url(#ip-sky)' }),
    // mountains
    svg('path', { class: 'ip-mtn-far', d: 'M0 260 L130 70 L250 190 L360 120 L520 250 L640 170 L800 260 L1000 150 L1000 560 L0 560 Z' }),
    svg('path', { class: 'ip-snow', d: 'M130 70 L98 116 L118 108 L132 122 L148 104 L165 120 Z' }),
    svg('path', { class: 'ip-flag', d: 'M132 70 V40 L154 48 L132 56' }),
    svg('path', { class: 'ip-hill', d: 'M0 330 C200 260 380 300 560 300 C760 300 860 250 1000 270 L1000 560 L0 560 Z' }),
    // trees
    ...[[560, 250], [600, 235], [940, 215], [975, 228], [30, 300], [70, 286]].map(([x, y]) => svg('path', { class: 'ip-tree', d: `M${x} ${y} l-14 34 h28 Z M${x} ${y + 18} l-18 40 h36 Z` })),
    // the trail: down from the peak, through a berm, over a jump
    svg('path', { class: 'ip-trail', d: 'M140 112 C220 170 330 190 440 240 C520 276 590 330 650 318 C700 308 720 290 760 300 L820 300 L860 262 L872 262' }),
    svg('path', { class: 'ip-berm', d: 'M600 330 C640 344 690 330 720 296' }),
    svg('path', { class: 'ip-trail', d: 'M930 270 L960 300 L1000 300' }),
    svg('path', { class: 'ip-kicker', d: 'M820 300 L860 262 L872 262 L872 300 Z' }),
    svg('path', { class: 'ip-arc', d: 'M872 262 Q902 200 932 270' }),
    // foreground ground
    svg('path', { class: 'ip-ground', d: 'M0 480 L1000 480 L1000 560 L0 560 Z' }), svg('line', { class: 'ip-ground-line', x1: 0, y1: 480, x2: 1000, y2: 480 }));
  const rider = svg('g', { transform: 'translate(380 480)' }, riderSide(230));
  // a brake rotor on the rear hub, and the fork drawn over the frame
  rider.append(svg('circle', { class: 'ip-rotor', cx: -119.6, cy: -69, r: 26 }),
    svg('line', { class: 'ip-fork', x1: 73.6, y1: -165.6, x2: 119.6, y2: -69 }));
  n.append(rider);
  return n;
}

// ---------- One ride: the trail profile (1000 × 300) ----------
// Height of the trail at x (0–1000), with a berm dip and a jump.
export function profileY(x) {
  const base = 50 + x * 0.2;                                  // a steady descent
  const berm = 38 * Math.exp(-(((x - 520) / 45) ** 2));          // the berm dips
  const kick = x > 620 && x < 680 ? -(x - 620) * 0.9 : 0;      // the takeoff ramps up
  return Math.min(260, base + berm + kick);
}
export function rideProfile(stages = STAGES) {
  const n = svg('svg', { viewBox: '0 0 1000 300', class: 'ls-scene-svg ip-profile', role: 'img' });
  n.append(svg('title', null, 'The trail from the top of the mountain to the bottom: a start, a descent, a berm, a jump and its landing, then a braking zone.'));
  let d = '';
  for (let x = 0; x <= 1000; x += 5) {
    if (x > 680 && x < 760) continue;                          // the gap of the jump
    d += (d && !(x === 760) ? ' L ' : (d ? ' M ' : 'M ')) + x + ' ' + profileY(x).toFixed(1);
  }
  let g = 'M 0 300';
  for (let x = 0; x <= 1000; x += 5) g += ` L ${x} ${(x > 680 && x < 760 ? 268 : profileY(x)).toFixed(1)}`;
  n.append(svg('rect', { x: 0, y: 0, width: 1000, height: 300, class: 'ip-profile-sky' }),
    svg('path', { class: 'ip-profile-ground', d: g + ' L 1000 300 Z' }),
    svg('path', { class: 'ip-trail', d }),
    svg('path', { class: 'ip-arc', d: `M 680 ${profileY(680).toFixed(1)} Q 720 ${profileY(680) - 60} 760 ${profileY(760).toFixed(1)}` }),
    svg('path', { class: 'ip-flag', d: `M 60 ${profileY(60) - 2} V ${profileY(60) - 34} L 82 ${profileY(60) - 26} L 60 ${profileY(60) - 18}` }));
  stages.forEach(st => { const x = st.x * 10; n.append(svg('line', { class: 'ip-stage-tick', x1: x, x2: x, y1: profileY(x) + 6, y2: 296 })); });
  const marker = svg('g', { class: 'ip-marker' }, riderSide(34));
  n.append(marker);
  return { node: n, marker };
}
// Where the rider marker sits for a stage (in the profile's coordinates).
export function stagePoint(st) { const x = st.x * 10; return { x, y: profileY(x) }; }

// ---------- the rider-bike system ----------
export function systemDiagram() {
  const n = svg('svg', { viewBox: '0 0 560 300', class: 'ls-pic', role: 'img' });
  n.append(svg('title', null, 'The rider and bike inside a dashed system boundary. Outside it: Earth pulls down (gravity), the trail pushes up, and the air pushes back.'),
    svg('rect', { class: 'ls-ground', x: 0, y: 232, width: 560, height: 68 }), svg('line', { class: 'ls-ground-line', x1: 0, y1: 232, x2: 560, y2: 232 }),
    svg('g', { transform: 'translate(280 232)' }, riderSide(120)),
    svg('rect', { class: 'ip-boundary', x: 190, y: 70, width: 180, height: 170, rx: 18 }),
    svg('text', { class: 'ip-boundary-t', x: 200, y: 62 }, 'SYSTEM: rider + bike'),
    arrow(280, 150, [0, 1], 70, 'g', 'Earth: gravity'),
    arrow(318, 250, [0, -1], 44, 'n', 'trail pushes up'),
    arrow(400, 130, [-1, 0], 40, 'r', 'air pushes back'),
    svg('text', { class: 'ls-small ip-surr', x: 14, y: 22 }, 'SURROUNDINGS: trail, air, Earth'));
  return n;
}

// ---------- the investigation loop ----------
export function workflow() {
  const steps = ['Ask a question', 'Form a hypothesis', 'Make a prediction', 'Design an experiment', 'Collect evidence', 'Analyze results', 'Draw a conclusion'];
  const W = 720, H = 250, n = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ls-pic ip-workflow', role: 'img' });
  n.append(svg('title', null, 'The investigation process: ask a question, form a hypothesis, make a prediction, design an experiment, collect evidence, analyze results, draw a conclusion, and loop back to improve.'));
  const pos = i => (i < 4 ? { x: 20 + i * 175, y: 30 } : { x: 20 + (6 - i) * 175 + 87, y: 150 });
  steps.forEach((s, i) => {
    const p = pos(i);
    n.append(svg('rect', { class: 'ip-step', x: p.x, y: p.y, width: 150, height: 64, rx: 8 }),
      svg('text', { class: 'ip-step-n', x: p.x + 12, y: p.y + 22 }, String(i + 1)),
      svg('text', { class: 'ip-step-t', x: p.x + 12, y: p.y + 46 }, s));
    if (i < steps.length - 1) {
      const q = pos(i + 1);
      if (i < 3) n.append(arrow(p.x + 152, p.y + 32, [1, 0], 20, 'flow'));
      else if (i === 3) n.append(arrow(p.x + 75, p.y + 66, [0, 1], 50, 'flow'));
      else n.append(arrow(p.x - 2, p.y + 32, [-1, 0], 20, 'flow'));
      void q;
    }
  });
  n.append(svg('path', { class: 'ip-loop', d: 'M 105 180 C 40 180 10 140 30 100' }), svg('text', { class: 'ls-small', x: 30, y: 236 }, '↺ results often send you back to a better question'));
  return n;
}

// ---------- real world vs. physics model ----------
export function realJump() {
  const n = svg('svg', { viewBox: '0 0 360 240', class: 'ls-pic ip-model-pic', role: 'img' });
  n.append(svg('title', null, 'The real jump: a rider in the air, body moving, wheels spinning, suspension extending, air pushing back.'),
    svg('rect', { x: 0, y: 0, width: 360, height: 240, class: 'ip-profile-sky' }),
    svg('path', { class: 'ip-profile-ground', d: 'M0 200 L70 200 L110 160 L120 200 L250 200 L300 180 L360 200 L360 240 L0 240 Z' }),
    svg('g', { transform: 'translate(190 120) rotate(-12)' }, riderSide(80, 0.6)),
    svg('path', { class: 'ip-wind', d: 'M300 70 h40 M290 90 h52 M305 110 h34' }),
    svg('text', { class: 'ls-small', x: 286, y: 60 }, 'drag'),
    svg('path', { class: 'ip-spin', d: 'M140 150 a 18 18 0 1 1 12 22' }), svg('text', { class: 'ls-small', x: 104, y: 186 }, 'wheels spin'),
    svg('text', { class: 'ls-small', x: 24, y: 40 }, 'body moves'), svg('path', { class: 'ip-spin', d: 'M96 44 q 40 -16 72 0' }),
    svg('text', { class: 'ls-small', x: 262, y: 160 }, 'suspension'), svg('path', { class: 'ip-spin', d: 'M258 156 q -10 -8 -20 -4' }));
  return n;
}
export function modelJump() {
  const n = svg('svg', { viewBox: '0 0 360 240', class: 'ls-pic ip-model-pic', role: 'img' });
  n.append(svg('title', null, 'The simplified model: a single point launched with an initial velocity, following a curved path under gravity, with its horizontal and vertical motion.'),
    svg('rect', { x: 0, y: 0, width: 360, height: 240, class: 'ip-profile-sky' }),
    svg('line', { class: 'ip-axis', x1: 30, y1: 200, x2: 340, y2: 200 }), svg('line', { class: 'ip-axis', x1: 30, y1: 200, x2: 30, y2: 20 }),
    svg('path', { class: 'ip-arc', d: 'M 60 180 Q 180 20 300 190' }),
    svg('circle', { class: 'ip-dot', cx: 120, cy: 120, r: 7 }),
    arrow(60, 180, [0.6, -0.8], 40, 'v', 'v₀'),
    arrow(120, 120, [0, 1], 40, 'g', 'g'),
    arrow(120, 120, [1, 0], 44, 'r', 'horizontal'),
    svg('text', { class: 'ls-small', x: 40, y: 228 }, 'a point, gravity only: no drag, no body, no spin'));
  return n;
}

// ---------- the branches of physics ----------
export function branchMap(count) {
  const n = svg('svg', { viewBox: '0 0 600 600', class: 'ls-scene-svg ip-branch-svg', role: 'img' });
  n.append(svg('title', null, 'Physics of the Ride at the centre, with seven branches of physics around it.'));
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / count, x = 300 + Math.cos(a) * 186, y = 300 + Math.sin(a) * 228;
    n.append(svg('line', { class: 'ip-branch-line', x1: 300, y1: 300, x2: x, y2: y }));
  }
  n.append(svg('circle', { class: 'ip-hub', cx: 300, cy: 300, r: 92 }),
    svg('text', { class: 'ip-hub-t', x: 300, y: 292, 'text-anchor': 'middle' }, 'PHYSICS'), svg('text', { class: 'ip-hub-t', x: 300, y: 322, 'text-anchor': 'middle' }, 'OF THE RIDE'));
  return n;
}
// Button centres (% of the map): an ellipse, narrower across so side labels stay inside.
export const branchPos = (i, count) => { const a = -Math.PI / 2 + i * 2 * Math.PI / count; return { x: 50 + Math.cos(a) * 31, y: 50 + Math.sin(a) * 38 }; };

export function visual(id) {
  if (id === 'system') return systemDiagram();
  if (id === 'workflow') return workflow();
  return svg('svg', { viewBox: '0 0 10 10' });
}
