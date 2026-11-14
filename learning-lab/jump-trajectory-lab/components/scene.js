// JumpScene: the jump as a rider sees it from the side. A takeoff lip at
// x = 0, a gap, a landing knuckle at x = L, both at the reference height,
// and the rider on the calculated path. It uses the model's y(x) and nothing
// else, so it always matches the graph. Equal scales, like the graph.
//
// createScene() -> { node, update({ model, rider, showDims }) }

import { el, svg, clear } from './dom.js';
import { dec } from '../logic/quadratic.js';

export function createScene() {
  const root = svg('svg', { class: 'jl-scene', role: 'img' });
  const node = el('figure', { class: 'jl-scene-wrap' }, root);

  function update({ model: m, rider, showDims = true, grid = false }) {
    clear(root);
    const X0 = -5, X1 = Math.max(m.L, 12) + 5, Y0 = -3.2, Y1 = Math.max(m.H, 3) + 1.4, K = 26;
    const W = (X1 - X0) * K, H = (Y1 - Y0) * K;
    const sx = x => (x - X0) * K, sy = y => (Y1 - y) * K;
    root.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // sky and distant ridge
    root.appendChild(svg('rect', { x: 0, y: 0, width: W, height: H, class: 'jl-sky' }));
    root.appendChild(svg('path', { d: `M0,${sy(-0.6)} L${W * 0.18},${sy(1.6)} L${W * 0.33},${sy(0.4)} L${W * 0.55},${sy(2.4)} L${W * 0.74},${sy(0.9)} L${W},${sy(2)} L${W},${H} L0,${H} Z`, class: 'jl-ridge' }));
    // ground: run-in up the takeoff ramp to the lip, the gap, the landing down from the knuckle
    const lipX = sx(0), lipY = sy(0), knX = sx(m.L), base = sy(-2.6);
    const takeoff = `M0,${base} L0,${sy(-1.1)} C${sx(-2.6)},${sy(-1.1)} ${sx(-0.9)},${sy(-0.5)} ${lipX},${lipY} L${lipX},${base} Z`;
    const gap = `M${lipX},${base} L${lipX},${sy(-1.4)} Q${(lipX + knX) / 2},${sy(-2.3)} ${knX},${sy(-1.4)} L${knX},${base} Z`;
    const landing = `M${knX},${lipY} L${sx(m.L + 0.6)},${lipY} C${sx(m.L + 2.4)},${sy(-0.2)} ${sx(m.L + 3.6)},${sy(-1.4)} ${W},${sy(-1.7)} L${W},${base} L${knX},${base} Z`;
    root.appendChild(svg('path', { d: takeoff, class: 'jl-dirt' }));
    root.appendChild(svg('path', { d: gap, class: 'jl-gap' }));
    root.appendChild(svg('path', { d: landing, class: 'jl-dirt' }));
    root.appendChild(svg('rect', { x: 0, y: base, width: W, height: H - base, class: 'jl-dirt' }));
    // optional faint 1 m grid, aligned with the coordinate plane (origin at the lip)
    if (grid) for (let gx = Math.ceil(X0); gx <= X1; gx++) root.appendChild(svg('line', { x1: sx(gx), x2: sx(gx), y1: 0, y2: H, class: 'jl-scene-grid' }));
    if (grid) for (let gy = Math.ceil(Y0); gy <= Y1; gy++) root.appendChild(svg('line', { y1: sy(gy), y2: sy(gy), x1: 0, x2: W, class: 'jl-scene-grid' }));
    // reference height
    root.appendChild(svg('line', { x1: lipX, x2: knX, y1: lipY, y2: lipY, class: 'jl-ref' }));
    // the calculated trajectory
    root.appendChild(svg('path', { d: 'M' + m.points(80).map(p => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' L'), class: 'jl-scene-traj' }));
    if (showDims) {
      // H at the apex, L along the bottom
      const ax = sx(m.vertex.x);
      root.appendChild(svg('line', { x1: ax, x2: ax, y1: lipY, y2: sy(m.H), class: 'jl-dim' }));
      root.appendChild(svg('text', { x: ax + 7, y: (lipY + sy(m.H)) / 2 + 4, class: 'jl-dim-label' }, `H = ${dec(m.H)} m`));
      const dy = sy(-0.55);
      root.appendChild(svg('line', { x1: lipX, x2: knX, y1: dy, y2: dy, class: 'jl-dim' }));
      root.appendChild(svg('text', { x: (lipX + knX) / 2, y: dy + 16, class: 'jl-dim-label', 'text-anchor': 'middle' }, `L = ${dec(m.L)} m`));
      root.appendChild(svg('text', { x: lipX - 34, y: lipY + 20, class: 'jl-dim-label', 'text-anchor': 'end' }, 'takeoff'));
      root.appendChild(svg('text', { x: knX + 34, y: lipY + 20, class: 'jl-dim-label' }, 'landing'));
    }
    // the rider, tilted along the path (slope dy/dx = 2a(x − L/2))
    const x = rider === undefined || rider === null ? 0 : rider, y = m.y(x);
    const deg = -Math.atan(2 * m.aValue * (x - m.L / 2)) * 180 / Math.PI;
    root.appendChild(svg('g', { transform: `translate(${sx(x)},${sy(y)}) rotate(${deg.toFixed(1)})`, class: 'jl-bike', 'aria-hidden': 'true' },
      svg('circle', { cx: -15, cy: -8, r: 9 }), svg('circle', { cx: 15, cy: -8, r: 9 }),
      svg('path', { d: 'M-15,-8 L-3,-20 L15,-8 M-3,-20 L9,-20 L15,-8 M9,-20 L11,-26 M-7,-36 L-3,-20 M-7,-36 L8,-27' }),
      svg('circle', { cx: -6, cy: -43, r: 5.5, class: 'jl-bike-head' })));
    root.setAttribute('aria-label', `Side view of the jump: takeoff at 0 m, landing at ${dec(m.L)} m, highest point ${dec(m.H)} m up at ${dec(m.vertex.x)} m. The rider is at ${dec(x, 1)} m, ${dec(y, 2)} m high.`);
  }
  return { node, update };
}
