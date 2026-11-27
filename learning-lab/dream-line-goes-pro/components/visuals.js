// The Dream Line Goes Pro: SVG illustrations. The equation balance, a rear
// shock with its O-ring (stroke, compression and sag), and the opening
// scene: an original slopestyle park under construction. Decorative parts
// never cover the maths.

import { svg } from '../../lesson-kit/dom.js';

const fit = t => (t.length > 22 ? 13 : t.length > 15 ? 16 : 20);
// A balance: tilt 0 balanced, −1 left side heavier (down), +1 right side down.
export function balanceSvg(left, right, tilt = 0, rel = '=') {
  const a = tilt * 7, s = svg('svg', { class: 'gp-balance' + (tilt ? ' is-tilted' : ''), viewBox: '0 0 560 220', role: 'img', 'aria-label': `Balance: ${left} on the left, ${right} on the right, ${tilt ? 'tipped: the sides are no longer equal' : 'level: the sides are equal'}` });
  s.appendChild(svg('path', { class: 'gp-bal-stand', d: 'M280 70 L250 200 H310 Z' }));
  s.appendChild(svg('rect', { class: 'gp-bal-base', x: 200, y: 198, width: 160, height: 10, rx: 3 }));
  const beam = svg('g', { class: 'gp-bal-beam', transform: `rotate(${a} 280 70)` });
  beam.appendChild(svg('rect', { x: 60, y: 64, width: 440, height: 10, rx: 4 }));
  for (const [x, t] of [[110, left], [450, right]]) {
    const pan = svg('g', { transform: `rotate(${-a} ${x} 69)` });
    pan.appendChild(svg('path', { class: 'gp-bal-string', d: `M${x} 69 L${x - 70} 130 M${x} 69 L${x + 70} 130` }));
    pan.appendChild(svg('path', { class: 'gp-bal-pan', d: `M${x - 90} 130 H${x + 90} Q${x + 80} 152 ${x} 152 Q${x - 80} 152 ${x - 90} 130 Z` }));
    pan.appendChild(svg('text', { class: 'gp-bal-text', x, y: 122, 'text-anchor': 'middle', style: { fontSize: fit(t) + 'px' } }, t));
    beam.appendChild(pan);
  }
  s.appendChild(beam);
  s.appendChild(svg('circle', { class: 'gp-bal-pivot', cx: 280, cy: 69, r: 9 }));
  s.appendChild(svg('text', { class: 'gp-bal-rel', x: 280, y: 40, 'text-anchor': 'middle' }, tilt ? '≠' : rel));
  return s;
}

// A rear shock seen side-on: body, exposed shaft, seal and O-ring. Stroke T and compression S in mm.
export function shockSvg(T, S) {
  const k = 6, x0 = 70, seal = x0 + 190, shaftEnd = seal + T * k, ring = seal + S * k;
  const s = svg('svg', { class: 'gp-shock', viewBox: '0 0 640 200', role: 'img', 'aria-label': `Rear shock with a ${T} mm stroke; the O-ring has moved ${S} mm along the shaft from the seal` });
  s.appendChild(svg('circle', { class: 'gp-shock-eye', cx: x0 - 30, cy: 90, r: 18 }));
  s.appendChild(svg('rect', { class: 'gp-shock-body', x: x0 - 12, y: 62, width: 202, height: 56, rx: 10 }));
  s.appendChild(svg('rect', { class: 'gp-shock-can', x: x0 + 30, y: 54, width: 120, height: 72, rx: 12 }));
  s.appendChild(svg('rect', { class: 'gp-shock-seal', x: seal - 6, y: 70, width: 8, height: 40 }));
  s.appendChild(svg('rect', { class: 'gp-shock-shaft', x: seal + 2, y: 80, width: shaftEnd - seal, height: 20, rx: 4 }));
  s.appendChild(svg('rect', { class: 'gp-shock-mount', x: shaftEnd, y: 70, width: 26, height: 40, rx: 6 }));
  s.appendChild(svg('circle', { class: 'gp-shock-eye', cx: shaftEnd + 44, cy: 90, r: 18 }));
  s.appendChild(svg('rect', { class: 'gp-shock-ring', x: ring - 2, y: 76, width: 8, height: 28, rx: 3 }));
  // stroke bracket
  s.appendChild(svg('path', { class: 'gp-shock-dim', d: `M${seal} 40 H${shaftEnd} M${seal} 34 V46 M${shaftEnd} 34 V46` }));
  s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: (seal + shaftEnd) / 2, y: 28 }, `stroke T = ${T} mm`));
  // compression bracket
  s.appendChild(svg('path', { class: 'gp-shock-dimS', d: `M${seal} 140 H${ring} M${seal} 134 V146 M${ring} 134 V146` }));
  s.appendChild(svg('text', { class: 'ms-svg-small', x: seal, y: 166 }, `compression S = ${S} mm (O-ring)`));
  return s;
}

// The opening scene: an original slopestyle park being engineered.
export function openingArt() {
  const s = svg('svg', { class: 'gp-art', viewBox: '0 0 640 420', role: 'img', 'aria-label': 'A slopestyle park on a hillside at dusk: a start tower, dirt jumps, a wooden wall ride and survey stakes, with engineering notes in the sky' });
  s.appendChild(svg('rect', { class: 'gp-art-sky', x: 0, y: 0, width: 640, height: 420 }));
  s.appendChild(svg('path', { class: 'gp-art-far', d: 'M0 200 L70 140 L140 175 L230 95 L320 160 L400 110 L480 165 L560 120 L640 150 V420 H0 Z' }));
  s.appendChild(svg('path', { class: 'gp-art-hill', d: 'M0 230 C160 190 380 215 640 180 V420 H0 Z' }));
  // start tower
  s.appendChild(svg('path', { class: 'gp-art-wood', d: 'M60 200 L74 120 H104 L118 200 M70 160 H108 M64 185 H114' }));
  s.appendChild(svg('rect', { class: 'gp-art-deck', x: 66, y: 112, width: 46, height: 10 }));
  // the line: drop-in, jumps, wall ride
  s.appendChild(svg('path', { class: 'gp-art-line', d: 'M112 118 C160 170 200 230 250 262 C300 290 360 300 420 330 C470 350 540 360 620 380' }));
  [[240, 262, 30], [330, 296, 34], [440, 336, 30]].forEach(([x, y, w]) => s.appendChild(svg('path', { class: 'gp-art-dirt', d: `M${x - w} ${y + 14} Q${x - w / 3} ${y - 22} ${x} ${y - 18} L${x} ${y + 14} Z` })));
  [[285, 300, 26], [378, 322, 26]].forEach(([x, y, w]) => s.appendChild(svg('path', { class: 'gp-art-dirt', d: `M${x} ${y - 16} Q${x + w / 2} ${y - 18} ${x + w} ${y + 14} H${x} Z` })));
  s.appendChild(svg('path', { class: 'gp-art-wood', d: 'M520 300 L540 250 H590 L570 300 Z M528 285 H578 M534 268 H584' }));
  // stakes and a survey line
  [[200, 236], [300, 282], [400, 318], [500, 350]].forEach(([x, y]) => s.appendChild(svg('g', { class: 'gp-art-stake', transform: `translate(${x} ${y})` }, svg('path', { d: 'M0 0 V-22' }), svg('path', { class: 'gp-art-flag', d: 'M0 -22 L12 -18 L0 -14 Z' }))));
  // notes
  s.appendChild(svg('g', { class: 'gp-art-note' }, svg('rect', { x: 330, y: 40, width: 262, height: 92, rx: 4 }),
    svg('text', { x: 346, y: 66 }, '18 + 6f = 30 + 4f'), svg('text', { x: 346, y: 92 }, 'G = 100R / L'), svg('text', { x: 346, y: 118 }, '45 + 12h ≤ 105')));
  return s;
}
