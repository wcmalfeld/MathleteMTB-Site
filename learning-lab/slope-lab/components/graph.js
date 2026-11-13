// A coordinate graph (SVG). Every axis is labeled with its own scale, so a
// graph never pretends its on-screen angle is the real one when the scales
// differ (it says so instead).
//
// createGraph(cfg) -> { node, update(cfg), setPicked(points) }
// cfg: {
//   x: { min, max, step, label }, y: { min, max, step, label },
//   lines:    [{ m, b } | { vertical: true, x }]   (style: 'main' | 'alt', name?)
//   points:   [{ x, y, label?, shape?: 'circle' | 'square' }]
//   riseRun:  { from: {x,y}, to: {x,y} }           dashed run and rise legs, labeled
//   ticks:    false to hide the numbers (shape-only pictures)
//   pick:     { onPick(points), max: 2, snap: 1 }  click/tap or keyboard to place points
//   title:    accessible name;  describe: () => text for screen readers
//   scaleNote: true to say when the two axes use different scales
// }

import { el, svg, clear, id } from './dom.js';
import { fmt, clean } from '../logic/slope.js';

const W = 560, H = 380, M = { l: 70, r: 18, t: 16, b: 54 };

export function createGraph(initial) {
  let cfg = initial, picked = [], cursor = null;
  const clipId = id('clip');
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sl-graph', role: 'img', focusable: 'false' });
  const live = el('p', { class: 'sl-sr', 'aria-live': 'polite' });
  const desc = el('p', { class: 'sl-sr' });
  const note = el('p', { class: 'sl-graph-note', hidden: true });
  const node = el('figure', { class: 'sl-graph-wrap' }, root, note, desc, live);

  const sx = x => M.l + (x - cfg.x.min) / (cfg.x.max - cfg.x.min) * (W - M.l - M.r);
  const sy = y => H - M.b - (y - cfg.y.min) / (cfg.y.max - cfg.y.min) * (H - M.t - M.b);
  const ix = px => cfg.x.min + (px - M.l) / (W - M.l - M.r) * (cfg.x.max - cfg.x.min);
  const iy = py => cfg.y.min + (H - M.b - py) / (H - M.t - M.b) * (cfg.y.max - cfg.y.min);
  const snap = (v, s) => clean(Math.round(v / s) * s);

  function draw() {
    clear(root);
    const { x, y } = cfg;
    const showTicks = cfg.ticks !== false;
    root.appendChild(svg('defs', null, svg('clipPath', { id: clipId }, svg('rect', { x: M.l, y: M.t, width: W - M.l - M.r, height: H - M.t - M.b }))));
    const g = svg('g');
    // grid
    for (let v = x.min; v <= x.max + 1e-9; v = clean(v + x.step)) g.appendChild(svg('line', { x1: sx(v), x2: sx(v), y1: M.t, y2: H - M.b, class: 'sl-grid' }));
    for (let v = y.min; v <= y.max + 1e-9; v = clean(v + y.step)) g.appendChild(svg('line', { y1: sy(v), y2: sy(v), x1: M.l, x2: W - M.r, class: 'sl-grid' }));
    // axes: at zero when zero is on the graph, otherwise along the edges
    const ax0 = y.min <= 0 && y.max >= 0 ? sy(0) : H - M.b, ay0 = x.min <= 0 && x.max >= 0 ? sx(0) : M.l;
    g.appendChild(svg('line', { x1: M.l, x2: W - M.r, y1: ax0, y2: ax0, class: 'sl-axis' }));
    g.appendChild(svg('line', { x1: ay0, x2: ay0, y1: M.t, y2: H - M.b, class: 'sl-axis' }));
    if (showTicks) {
      const every = n => Math.max(1, Math.ceil(n / 10));
      const xs = Math.round((x.max - x.min) / x.step), ys = Math.round((y.max - y.min) / y.step);
      for (let i = 0; i <= xs; i += every(xs)) { const v = clean(x.min + i * x.step); g.appendChild(svg('text', { x: sx(v), y: H - M.b + 20, class: 'sl-tick', 'text-anchor': 'middle' }, fmt(v))); }
      for (let i = 0; i <= ys; i += every(ys)) { const v = clean(y.min + i * y.step); g.appendChild(svg('text', { x: M.l - 8, y: sy(v) + 4, class: 'sl-tick', 'text-anchor': 'end' }, fmt(v))); }
    }
    if (x.label) g.appendChild(svg('text', { x: (M.l + W - M.r) / 2, y: H - 8, class: 'sl-axis-label', 'text-anchor': 'middle' }, x.label));
    if (y.label) g.appendChild(svg('text', { x: 14, y: (M.t + H - M.b) / 2, class: 'sl-axis-label', 'text-anchor': 'middle', transform: `rotate(-90 14 ${(M.t + H - M.b) / 2})` }, y.label));
    root.appendChild(g);

    const plot = svg('g', { 'clip-path': `url(#${clipId})` });
    (cfg.lines || []).forEach(L => {
      const cls = 'sl-line' + (L.style === 'alt' ? ' sl-line--alt' : '');
      if (L.vertical) plot.appendChild(svg('line', { x1: sx(L.x), x2: sx(L.x), y1: M.t, y2: H - M.b, class: cls }));
      else plot.appendChild(svg('line', { x1: sx(x.min), x2: sx(x.max), y1: sy(L.m * x.min + L.b), y2: sy(L.m * x.max + L.b), class: cls }));
    });
    if (cfg.riseRun) {
      const { from: a, to: b } = cfg.riseRun, corner = { x: b.x, y: a.y };
      plot.appendChild(svg('line', { x1: sx(a.x), y1: sy(a.y), x2: sx(corner.x), y2: sy(corner.y), class: 'sl-run' }));
      plot.appendChild(svg('line', { x1: sx(corner.x), y1: sy(corner.y), x2: sx(b.x), y2: sy(b.y), class: 'sl-rise' }));
      const runV = clean(b.x - a.x), riseV = clean(b.y - a.y);
      root.appendChild(svg('text', { x: (sx(a.x) + sx(corner.x)) / 2, y: sy(corner.y) + (riseV >= 0 ? 18 : -8), class: 'sl-leg-label', 'text-anchor': 'middle' }, 'run ' + fmt(runV)));
      const rightSide = runV >= 0 && sx(corner.x) < W - M.r - 90;   // flip inside when it would run off the edge
      root.appendChild(svg('text', { x: sx(corner.x) + (rightSide ? 8 : -8), y: (sy(corner.y) + sy(b.y)) / 2 + 4, class: 'sl-leg-label', 'text-anchor': rightSide ? 'start' : 'end' }, 'rise ' + fmt(riseV)));
    }
    root.appendChild(plot);

    const pts = (cfg.points || []).concat(picked.map((p, i) => ({ ...p, label: p.label || (cfg.pick && cfg.pick.labels ? cfg.pick.labels[i] : null), picked: true, shape: i ? 'square' : 'circle' })));
    pts.forEach(p => {
      if (p.x < x.min - 1e-9 || p.x > x.max + 1e-9 || p.y < y.min - 1e-9 || p.y > y.max + 1e-9) return;
      const cx = sx(p.x), cy = sy(p.y);
      const mark = p.shape === 'square'
        ? svg('rect', { x: cx - 6, y: cy - 6, width: 12, height: 12, class: 'sl-pt' + (p.picked ? ' sl-pt--picked' : '') })
        : svg('circle', { cx, cy, r: 6.5, class: 'sl-pt' + (p.picked ? ' sl-pt--picked' : '') });
      root.appendChild(mark);
      const label = p.label === undefined ? `(${fmt(p.x)}, ${fmt(p.y)})` : p.label;
      if (label) {
        const right = cx < W - 120;
        root.appendChild(svg('text', { x: cx + (right ? 11 : -11), y: cy - 10, class: 'sl-pt-label', 'text-anchor': right ? 'start' : 'end' }, label));
      }
    });

    if (cfg.pick) {
      const hit = svg('rect', { x: M.l, y: M.t, width: W - M.l - M.r, height: H - M.t - M.b, class: 'sl-hit' });
      hit.addEventListener('pointerdown', e => {
        const r = root.getBoundingClientRect();
        const px = (e.clientX - r.left) * W / r.width, py = (e.clientY - r.top) * H / r.height;
        const s = cfg.pick.snap || 1;
        place({ x: snap(ix(px), s), y: snap(iy(py), s) });
      });
      root.appendChild(hit);
      if (cursor) {
        root.appendChild(svg('circle', { cx: sx(cursor.x), cy: sy(cursor.y), r: 10, class: 'sl-cursor' }));
      }
    }

    const ttl = cfg.title || 'Coordinate graph';
    root.setAttribute('aria-label', ttl);
    desc.textContent = typeof cfg.describe === 'function' ? cfg.describe() : describe();
    const sxScale = (x.max - x.min) / (W - M.l - M.r), syScale = (y.max - y.min) / (H - M.t - M.b);
    const differ = Math.abs(sxScale - syScale) / Math.max(sxScale, syScale) > 0.05;
    note.hidden = !(cfg.scaleNote && differ);
    note.textContent = 'The two axes use different scales, so the line’s angle on screen is not the real angle. Read the slope from the numbers.';
  }

  function describe() {
    const parts = [];
    (cfg.lines || []).forEach(L => parts.push(L.vertical ? `a vertical line at x = ${fmt(L.x)}` : `a line with slope ${fmt(L.m)} crossing the y-axis at ${fmt(L.b)}`));
    (cfg.points || []).concat(picked).forEach(p => parts.push(`a point at (${fmt(p.x)}, ${fmt(p.y)})`));
    return `Graph, x from ${fmt(cfg.x.min)} to ${fmt(cfg.x.max)}, y from ${fmt(cfg.y.min)} to ${fmt(cfg.y.max)}` + (parts.length ? ': ' + parts.join('; ') + '.' : '.');
  }

  function place(p) {
    if (p.x < cfg.x.min || p.x > cfg.x.max || p.y < cfg.y.min || p.y > cfg.y.max) return;
    const max = cfg.pick.max || 2;
    picked = picked.length >= max ? [p] : picked.concat([p]);
    live.textContent = `Point ${picked.length} placed at (${fmt(p.x)}, ${fmt(p.y)}).` + (picked.length === max ? '' : ' Place the next point.');
    draw();
    cfg.pick.onPick(picked.slice());
  }

  // Keyboard: focus the graph, move with the arrow keys, Enter or Space places a point.
  root.addEventListener('focus', () => {
    if (!cfg.pick) return;
    if (!cursor) { const s = cfg.pick.snap || 1; cursor = { x: snap((cfg.x.min + cfg.x.max) / 2, s), y: snap((cfg.y.min + cfg.y.max) / 2, s) }; }
    live.textContent = `Cursor at (${fmt(cursor.x)}, ${fmt(cursor.y)}). Use the arrow keys to move and Enter to place a point.`;
    draw();
  });
  root.addEventListener('blur', () => { if (cfg.pick) { cursor = null; draw(); } });
  root.addEventListener('keydown', e => {
    if (!cfg.pick || !cursor) return;
    const s = cfg.pick.snap || 1, move = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
    if (move) {
      e.preventDefault();
      cursor = { x: Math.min(cfg.x.max, Math.max(cfg.x.min, clean(cursor.x + move[0]))), y: Math.min(cfg.y.max, Math.max(cfg.y.min, clean(cursor.y + move[1]))) };
      live.textContent = `(${fmt(cursor.x)}, ${fmt(cursor.y)})`;
      draw();
    } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place({ ...cursor }); }
  });

  function update(next) {
    cfg = Object.assign({}, cfg, next);
    // A pickable graph is a control: focusable, and announced as one.
    if (cfg.pick) { root.setAttribute('tabindex', '0'); root.setAttribute('role', 'application'); }
    else { root.removeAttribute('tabindex'); root.setAttribute('role', 'img'); }
    draw();
  }
  update({});
  return { node, update, setPicked(p) { picked = p.slice(); draw(); }, get picked() { return picked.slice(); } };
}
