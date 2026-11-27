// The Dream Line Project: SVG illustrations. Feature icons, the top-down park
// map in three environments (visual only: the maths is the same in each),
// the stage landmarks that light up as badges are earned, and the opening
// art. The map is a concept sketch, not a scaled construction plan.

import { svg } from '../../lesson-kit/dom.js';
import { SPOTS, LINES, byId, BADGES } from '../logic/park.js';

// ------------------------------------------------------------ feature icons (40 × 40, side or top view)
const ICON = {
  tabletop: () => [svg('path', { class: 'dl-ic-dirt', d: 'M3 32 L13 17 H27 L37 32 Z' }), svg('path', { class: 'dl-ic-line', d: 'M13 17 H27' })],
  hip: () => [svg('path', { class: 'dl-ic-dirt', d: 'M3 33 L12 20 L18 33 Z' }), svg('path', { class: 'dl-ic-dirt', d: 'M22 33 L29 21 L37 33 Z' }), svg('path', { class: 'dl-ic-arc', d: 'M13 18 Q20 6 29 18' }), svg('path', { class: 'dl-ic-arc', d: 'M26 13 l3 5 l-5 0' })],
  stepup: () => [svg('path', { class: 'dl-ic-dirt', d: 'M3 33 L13 22 L16 33 Z' }), svg('path', { class: 'dl-ic-dirt', d: 'M20 33 V14 H31 L37 33 Z' }), svg('path', { class: 'dl-ic-arc', d: 'M14 20 Q18 8 24 13' })],
  stepdown: () => [svg('path', { class: 'dl-ic-dirt', d: 'M3 33 V14 H11 L17 33 Z' }), svg('path', { class: 'dl-ic-dirt', d: 'M22 33 L31 24 L37 33 Z' }), svg('path', { class: 'dl-ic-arc', d: 'M11 13 Q20 8 29 22' })],
  drop: () => [svg('rect', { class: 'dl-ic-wood', x: 3, y: 12, width: 15, height: 5 }), svg('path', { class: 'dl-ic-post', d: 'M6 17 V33 M15 17 V33' }), svg('path', { class: 'dl-ic-dirt', d: 'M18 33 Q28 31 37 22 V33 Z' })],
  wallride: () => [svg('path', { class: 'dl-ic-wood', d: 'M8 33 L14 6 H32 L26 33 Z' }), svg('path', { class: 'dl-ic-plank', d: 'M12.5 26 H28 M14 19 H29.5 M15.5 12 H31' })],
  berm: () => [svg('path', { class: 'dl-ic-dirt', d: 'M6 34 V18 A14 14 0 0 1 34 18 V34 H26 V18 A6 6 0 0 0 14 18 V34 Z' }), svg('path', { class: 'dl-ic-arc', d: 'M10 33 V19 A10 10 0 0 1 30 19 V33' })],
  roller: () => [svg('path', { class: 'dl-ic-dirt', d: 'M3 33 Q20 6 37 33 Z' })],
  pump: () => [svg('path', { class: 'dl-ic-dirt', d: 'M2 33 Q8 18 14 33 Q20 18 26 33 Q32 18 38 33 Z' })]
};
export function featureIcon(id, size = 40, cls) {
  return svg('svg', { class: 'dl-icon' + (cls ? ' ' + cls : ''), viewBox: '0 0 40 40', width: size, height: size, 'aria-hidden': 'true', focusable: 'false' }, ICON[id] ? ICON[id]() : null);
}

// ------------------------------------------------------------ environments
function tree(x, y, r) { return svg('g', { class: 'dl-tree' }, svg('circle', { cx: x, cy: y, r }), svg('circle', { class: 'dl-tree-hi', cx: x - r * 0.3, cy: y - r * 0.3, r: r * 0.45 })); }
function backdrop(env) {
  const g = svg('g', { class: 'dl-env dl-env--' + env });
  g.appendChild(svg('rect', { class: 'dl-ground', x: 0, y: 0, width: 800, height: 520 }));
  // contour lines: the hill falls from the top of the map to the bottom
  for (let k = 0; k < 6; k++) g.appendChild(svg('path', { class: 'dl-contour', d: `M0 ${70 + k * 80} C200 ${50 + k * 80} 600 ${95 + k * 80} 800 ${68 + k * 80}` }));
  if (env === 'forest') {
    [[30, 60, 22], [62, 140, 18], [28, 250, 24], [58, 360, 19], [26, 470, 21], [772, 70, 22], [742, 160, 17], [774, 270, 24], [745, 380, 18], [772, 470, 22], [280, 40, 14], [530, 45, 15], [285, 270, 16], [520, 260, 15], [300, 470, 13], [520, 480, 14]]
      .forEach(([x, y, r]) => g.appendChild(tree(x, y, r)));
  } else if (env === 'alpine') {
    g.appendChild(svg('path', { class: 'dl-peak', d: 'M0 0 H800 V36 L700 8 L610 40 L520 4 L430 38 L330 6 L240 40 L150 10 L60 38 L0 18 Z' }));
    g.appendChild(svg('path', { class: 'dl-snow', d: 'M0 0 H800 V12 L700 8 L655 22 L610 12 L520 4 L475 20 L430 10 L330 6 L285 22 L240 12 L150 10 L105 24 L60 12 L0 10 Z' }));
    [[40, 200, 26], [760, 300, 30], [270, 380, 18], [540, 170, 16], [60, 430, 22], [740, 120, 20]].forEach(([x, y, r]) => g.appendChild(svg('path', { class: 'dl-rock', d: `M${x - r} ${y + r * 0.6} L${x - r * 0.4} ${y - r * 0.7} L${x + r * 0.5} ${y - r * 0.5} L${x + r} ${y + r * 0.6} Z` })));
  } else {
    g.appendChild(svg('path', { class: 'dl-fence', d: 'M8 8 H792 V512 H8 Z' }));
    for (let x = 8; x <= 792; x += 28) { g.appendChild(svg('path', { class: 'dl-fence-post', d: `M${x} 4 V12 M${x} 508 V516` })); }
    g.appendChild(svg('rect', { class: 'dl-house', x: 22, y: 22, width: 70, height: 52 }));
    g.appendChild(svg('path', { class: 'dl-roof', d: 'M18 26 L57 6 L96 26 Z' }));
    g.appendChild(svg('rect', { class: 'dl-patio', x: 700, y: 24, width: 76, height: 46 }));
    [[290, 60, 12], [520, 430, 13], [40, 300, 15], [770, 250, 14]].forEach(([x, y, r]) => g.appendChild(tree(x, y, r)));
  }
  return g;
}

const LINE_PATH = l => 'M' + l.spots.map(([x, y]) => x + ' ' + y).join(' L');
// Where each landmark sits, and how it's drawn.
const LANDMARKS = {
  blueprint: { x: 400, y: 28, draw: () => [svg('rect', { x: -14, y: -10, width: 28, height: 22, class: 'dl-lm-body' }), svg('path', { d: 'M-18 -10 L0 -24 L18 -10 Z', class: 'dl-lm-roof' })] },
  plan: { x: 66, y: 486, draw: () => [svg('rect', { x: -20, y: -12, width: 40, height: 24, class: 'dl-lm-body' }), svg('path', { d: 'M-24 -12 L0 -26 L24 -12 Z', class: 'dl-lm-roof' })] },
  materials: { x: 734, y: 486, draw: () => [svg('rect', { x: -22, y: -6, width: 14, height: 14, class: 'dl-lm-body' }), svg('rect', { x: -6, y: -12, width: 14, height: 20, class: 'dl-lm-body' }), svg('rect', { x: 10, y: -2, width: 14, height: 10, class: 'dl-lm-body' })] },
  toolkit: { x: 400, y: 494, draw: () => [svg('path', { d: 'M-30 14 V-12 Q0 -30 30 -12 V14', class: 'dl-lm-arch' })] }
};

// The park map. o: { interactive, selectedSpot, earned: Set of mission ids, highlight: spot index, label }
export function parkMap(park, o = {}) {
  const root = svg('svg', { class: 'dl-map', viewBox: '0 0 800 520', role: o.interactive ? 'group' : 'img', 'aria-label': o.label || 'Park map' });
  root.appendChild(backdrop(park.env));
  for (const l of LINES) {
    root.appendChild(svg('path', { class: 'dl-line dl-line--' + l.id, d: LINE_PATH(l) }));
    const [x, y] = l.spots[0];
    root.appendChild(svg('text', { class: 'dl-line-label', x, y: y - 46, 'text-anchor': 'middle' }, l.short));
  }
  for (const m of BADGES) {
    const L = LANDMARKS[m.mission], lit = o.earned && o.earned.has(m.mission);
    root.appendChild(svg('g', { class: 'dl-landmark' + (lit ? ' is-lit' : ''), transform: `translate(${L.x} ${L.y})` }, L.draw(),
      lit ? svg('text', m.mission === 'blueprint' ? { class: 'dl-lm-label', x: 26, y: 4, 'text-anchor': 'start' } : { class: 'dl-lm-label', y: -30, 'text-anchor': 'middle' }, m.landmark) : null));
  }
  for (const s of SPOTS) {
    const f = park.slots[s.index] ? byId[park.slots[s.index]] : null;
    const g = svg('g', { class: 'dl-spot' + (f ? ' is-filled' : '') + (o.selectedSpot === s.index ? ' is-selected' : '') + (o.highlight === s.index ? ' is-new' : ''), transform: `translate(${s.x} ${s.y})`, 'data-spot': s.index });
    if (o.interactive) {
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${s.lineName}, spot ${s.n}: ${f ? f.name + ' (letter ' + f.letter + ')' : 'empty'}${o.selectedSpot === s.index ? ', selected' : ''}`);
    }
    g.appendChild(svg('circle', { class: 'dl-spot-ring', r: 31 }));
    if (f) {
      g.appendChild(svg('circle', { class: 'dl-spot-pad', r: 27 }));
      const icon = featureIcon(f.id, 40); icon.setAttribute('x', -20); icon.setAttribute('y', -22);
      g.appendChild(icon);
      g.appendChild(svg('text', { class: 'dl-spot-tag', y: 22, 'text-anchor': 'middle' }, f.letter));
    } else g.appendChild(svg('path', { class: 'dl-spot-plus', d: 'M-8 0 H8 M0 -8 V8' }));
    root.appendChild(g);
  }
  return root;
}

// ------------------------------------------------------------ opening art
export function openingArt() {
  const s = svg('svg', { class: 'dl-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': 'An empty hillside marked out as a blueprint grid, with survey stakes and flags waiting for a bike park to be designed' });
  s.appendChild(svg('rect', { class: 'dl-art-sky', x: 0, y: 0, width: 640, height: 420 }));
  s.appendChild(svg('path', { class: 'dl-art-far', d: 'M0 170 L90 110 L170 150 L260 80 L360 140 L450 95 L540 150 L640 105 V420 H0 Z' }));
  s.appendChild(svg('path', { class: 'dl-art-hill', d: 'M0 210 C160 170 420 190 640 160 V420 H0 Z' }));
  const grid = svg('g', { class: 'dl-art-grid' });
  for (let k = 0; k <= 8; k++) grid.appendChild(svg('path', { d: `M${120 + k * 50} 220 L${40 + k * 70} 410` }));
  for (let k = 0; k <= 5; k++) { const y = 220 + k * 38, t = k / 5; grid.appendChild(svg('path', { d: `M${120 - 80 * t} ${y} L${520 + 80 * t} ${y}` })); }
  s.appendChild(grid);
  // a dashed planned line, with stakes and flags
  s.appendChild(svg('path', { class: 'dl-art-plan', d: 'M300 214 C250 260 360 290 300 330 C250 365 330 390 300 412' }));
  [[300, 214], [282, 262], [330, 296], [276, 350], [314, 392]].forEach(([x, y], i) => s.appendChild(svg('g', { class: 'dl-art-stake', transform: `translate(${x} ${y})` },
    svg('path', { d: 'M0 0 V-26' }), svg('path', { class: i % 2 ? 'dl-art-flag2' : 'dl-art-flag', d: 'M0 -26 L14 -21 L0 -16 Z' }))));
  s.appendChild(svg('g', { class: 'dl-art-label' }, svg('rect', { x: 430, y: 236, width: 168, height: 52 }),
    svg('text', { x: 444, y: 258 }, 'H = 4t + 3b + 5'), svg('text', { class: 'dl-art-small', x: 444, y: 278 }, 'blueprint pending…')));
  for (let i = 0; i < 4; i++) s.appendChild(tree(40 + i * 26, 250 + (i % 2) * 22, 13));
  return s;
}
