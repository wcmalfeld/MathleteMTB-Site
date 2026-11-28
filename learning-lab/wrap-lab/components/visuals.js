// Wrap Lab: illustrations. Three original side-view frames (downhill,
// enduro, dirt jump) with six selectable protection zones, the film
// patterns, and the opening art. Decoration only: no maths depends on the
// drawing, and it's not a scaled template of any real frame.

import { svg } from '../../lesson-kit/dom.js';
import { PALETTES } from '../logic/studio.js';

// Frame geometry per bike: rear axle R, bottom bracket B, seat cluster S, seat top T, head top H, head bottom D, front axle F, fork mid M.
const GEO = {
  dh: { R: [70, 168], B: [160, 172], S: [150, 104], T: [146, 82], H: [252, 78], D: [262, 104], F: [306, 168], M: [284, 136], wheel: 40, dual: true },
  enduro: { R: [72, 168], B: [162, 170], S: [146, 92], T: [140, 66], H: [244, 82], D: [252, 106], F: [298, 168], M: [276, 138], wheel: 40, dual: false },
  dj: { R: [84, 170], B: [160, 170], S: [148, 104], T: [144, 84], H: [236, 90], D: [242, 110], F: [284, 170], M: [264, 142], wheel: 34, dual: false }
};
const seg = (a, b) => `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`;
export const ZONE_PATHS = g => ({ top: seg(g.S, g.H), down: seg(g.B, g.D), seat: seg(g.B, g.T), stays: seg(g.R, g.S), chain: seg(g.R, g.B), fork: seg(g.M, g.F) });
let n = 0;
function patternDefs(s, pal, pattern, finish) {
  const id = 'wp' + (++n), [c1, c2, c3] = (PALETTES.find(p => p.id === pal) || PALETTES[0]).c;
  const P = svg('pattern', { id, patternUnits: 'userSpaceOnUse', width: 12, height: 12, patternTransform: pattern === 'stripes' ? 'rotate(35)' : '' });
  P.append(svg('rect', { width: 12, height: 12, fill: c1 }));
  if (pattern === 'stripes') P.append(svg('rect', { width: 5, height: 12, fill: c2 }));
  else if (pattern === 'topo') P.append(svg('path', { d: 'M0 6 Q3 2 6 6 T12 6 M0 11 Q3 8 6 11 T12 11', fill: 'none', stroke: c2, 'stroke-width': 1.4 }));
  else if (pattern === 'geo') P.append(svg('path', { d: 'M0 12 L6 0 L12 12 Z', fill: c2 }), svg('circle', { cx: 6, cy: 8, r: 1.5, fill: c3 }));
  else P.append(svg('rect', { x: 2, y: 2, width: 8, height: 8, rx: 1, fill: c3 }), svg('text', { x: 6, y: 9, 'text-anchor': 'middle', 'font-size': 7, fill: c1, 'font-family': 'monospace' }, '7'));
  const defs = svg('defs'); defs.append(P);
  if (finish === 'gloss') { const G = svg('linearGradient', { id: id + 'g', x1: 0, y1: 0, x2: 0, y2: 1 }); G.append(svg('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': 0.45 }), svg('stop', { offset: '0.5', 'stop-color': '#fff', 'stop-opacity': 0 })); defs.append(G); }
  s.append(defs);
  return id;
}
// The frame canvas: opts = { bike, zones: Set, palette, pattern, finish, focus, onZone(id), names, label }
export function frameSvg(opts = {}) {
  const g = GEO[opts.bike] || GEO.enduro, zones = opts.zones || new Set();
  const s = svg('svg', { class: 'wrp-frame', viewBox: '0 0 360 220', role: 'img', 'aria-label': opts.label || 'A mountain bike frame with its protection zones' });
  s.append(svg('rect', { class: 'wrp-frame-bg', x: 0, y: 0, width: 360, height: 220, rx: 12 }));
  const pid = patternDefs(s, opts.palette, opts.pattern || 'stripes', opts.finish);
  [g.R, g.F].forEach(([x, y]) => { s.append(svg('circle', { class: 'wrp-tire', cx: x, cy: y, r: g.wheel }), svg('circle', { class: 'wrp-rim', cx: x, cy: y, r: g.wheel - 8 }), svg('circle', { class: 'wrp-hub', cx: x, cy: y, r: 3.5 })); });
  const P = ZONE_PATHS(g);
  // the bare frame
  s.append(svg('path', { class: 'wrp-tube', d: Object.values(P).join(' ') + ' ' + seg(g.H, g.D) + (g.dual ? ` M${g.H[0] - 6} ${g.H[1] - 4} L${g.M[0] - 6} ${g.M[1]}` : '') }));
  if (opts.bike !== 'dj') s.append(svg('path', { class: 'wrp-shock', d: seg([g.B[0] - 6, g.B[1] - 22], [g.S[0] - 10, g.S[1] + 26]) }));
  s.append(svg('path', { class: 'wrp-bar', d: `M${g.H[0] - 10} ${g.H[1] - 10} L${g.H[0] + 22} ${g.H[1] - 14} M${g.H[0]} ${g.H[1]} L${g.H[0] + 2} ${g.H[1] - 12} M${g.T[0] - 14} ${g.T[1] - 2} L${g.T[0] + 14} ${g.T[1] - 4}` }));
  // the protection zones: covered ones get the film; all can be selected
  for (const [id, d] of Object.entries(P)) {
    const on = zones.has(id), z = svg('path', { class: 'wrp-zone' + (on ? ' is-on' : '') + (opts.focus === id ? ' is-focus' : ''), d, style: on ? `stroke: url(#${pid})` : null });
    if (opts.onZone) { z.setAttribute('role', 'button'); z.setAttribute('tabindex', '0'); z.setAttribute('aria-label', `${(opts.names || {})[id] || id}${on ? ', covered' : ''}`); z.setAttribute('aria-pressed', String(on)); z.addEventListener('click', () => opts.onZone(id)); z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onZone(id); } }); }
    s.append(z);
    if (on && opts.finish === 'gloss') s.append(svg('path', { class: 'wrp-gloss', d, style: `stroke: url(#${pid}g)` }));
  }
  if (opts.name) s.append(svg('text', { class: 'wrp-name', x: (g.B[0] + g.D[0]) / 2, y: (g.B[1] + g.D[1]) / 2 + 22, 'text-anchor': 'middle' }, opts.name.toUpperCase().slice(0, 18)));
  return s;
}
export function openingArt() {
  const s = svg('svg', { class: 'wrp-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': 'An enduro frame with patterned protection film on its tubes beside an area model of (x + 3)(x + 4) split into x², 4x, 3x and 12' });
  s.append(svg('rect', { class: 'wrp-art-bg', x: 0, y: 0, width: 640, height: 420 }));
  const f = frameSvg({ bike: 'enduro', zones: new Set(['top', 'down', 'stays', 'chain', 'fork']), palette: 'ember', pattern: 'geo', finish: 'gloss' });
  f.setAttribute('x', 10); f.setAttribute('y', 20); f.setAttribute('width', 380); f.setAttribute('height', 232); s.append(f);
  // the area model (x + 3)(x + 4): x = 120 px, 1 = 22 px
  const ox = 420, oy = 60, X = 120, U = 22;
  [[0, 0, X, X, 'x²', 'is-x2'], [X, 0, 4 * U, X, '4x', 'is-x'], [0, X, X, 3 * U, '3x', 'is-x'], [X, X, 4 * U, 3 * U, '12', 'is-1']].forEach(([x, y, w, h, t, c]) => {
    s.append(svg('rect', { class: 'wrp-art-tile ' + c, x: ox + x, y: oy + y, width: w, height: h }));
    s.append(svg('text', { class: 'wrp-art-t', x: ox + x + w / 2, y: oy + y + h / 2 + 5, 'text-anchor': 'middle' }, t));
  });
  s.append(svg('text', { class: 'wrp-art-k', x: ox + (X + 4 * U) / 2, y: oy - 12, 'text-anchor': 'middle' }, 'x + 4'));
  s.append(svg('text', { class: 'wrp-art-k', x: ox - 10, y: oy + (X + 3 * U) / 2, 'text-anchor': 'end' }, 'x + 3'));
  s.append(svg('rect', { class: 'wrp-art-panel', x: 20, y: 290, width: 600, height: 110, rx: 10 }));
  s.append(svg('text', { class: 'wrp-art-eq', x: 320, y: 335, 'text-anchor': 'middle' }, '(x + 3)(x + 4) = x² + 7x + 12'));
  s.append(svg('text', { class: 'wrp-art-sub', x: 320, y: 370, 'text-anchor': 'middle' }, 'expand it · factor it back · make it yours'));
  return s;
}
