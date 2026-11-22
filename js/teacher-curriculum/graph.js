// ============================================================
// Teacher Curriculum: graphs and diagrams drawn from data.
//
// A lesson describes a figure; this file draws it as SVG (crisp on a
// projector and in print). Coordinates are math coordinates (y up).
//
//   { x: [xmin, xmax], y: [ymin, ymax],
//     axes: true, grid: true, ticks: 1 | {x, y}, equal: false,
//     xLabel, yLabel, items: [...] }
//
// Items (c: 'a' rust | 'b' moss | 'c' ink | 'd' gold, default 'a'):
//   {line: [m, b]}                y = mx + b
//   {vline: x} {hline: y}         (dash: true for asymptotes)
//   {fn: 'quad', a, h, k}         y = a(x − h)² + k
//   {fn: 'poly', coef: [c0, c1, …]}   y = c0 + c1·x + c2·x² …
//   {fn: 'exp', a, b, k}          y = a·bˣ + k
//   {fn: 'log', a, b, h}          y = a·log_b(x − h)
//   {fn: 'sin' | 'cos', A, B, C, D}   y = A·sin(B(x − C)) + D
//   {fn: 'abs', a, h, k}          y = a|x − h| + k
//   {seg: [[x1, y1], [x2, y2]], arrow}   {path: [[x, y], …]}   {poly: [[x, y], …], fill}
//   {pts: [[x, y, 'label'], …]}   {text: [x, y, 'words'], anchor: 'start'|'middle'|'end'}
//   {riseRun: [[x1, y1], [x2, y2]]}      rise and run legs, labelled
//   {angle: {at, from, to, label, right}}   an angle mark at vertex `at`
//   {marks: [[x1, y1], [x2, y2]], n}     n congruence ticks on a segment
//   {circle: [cx, cy, r]}
// Any item can have `label` (and line-like items `dash`).
//
// checkGraph() is pure (Node checks every figure at build time);
// graphSvg() builds the SVG in the browser.
// ============================================================

const KINDS = ['line', 'vline', 'hline', 'fn', 'seg', 'path', 'poly', 'pts', 'text', 'riseRun', 'angle', 'marks', 'circle'];
const FNS = ['quad', 'poly', 'exp', 'log', 'sin', 'cos', 'abs'];
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isPt = p => Array.isArray(p) && p.length >= 2 && isNum(p[0]) && isNum(p[1]);

export function checkGraph(g) {
  const errs = [];
  if (!g || typeof g !== 'object') return ['figure is not an object'];
  if (!Array.isArray(g.x) || g.x.length !== 2 || !isNum(g.x[0]) || !isNum(g.x[1]) || g.x[0] >= g.x[1]) errs.push('x must be [min, max]');
  if (!Array.isArray(g.y) || g.y.length !== 2 || !isNum(g.y[0]) || !isNum(g.y[1]) || g.y[0] >= g.y[1]) errs.push('y must be [min, max]');
  if (!Array.isArray(g.items) || !g.items.length) errs.push('figure has no items');
  (g.items || []).forEach((it, i) => {
    const kind = KINDS.find(k => k in it);
    if (!kind) { errs.push(`item ${i + 1} is not a known kind (${Object.keys(it).join(', ')})`); return; }
    const v = it[kind];
    const bad = () => errs.push(`item ${i + 1} (${kind}) is malformed`);
    switch (kind) {
      case 'line': if (!Array.isArray(v) || !isNum(v[0]) || !isNum(v[1])) bad(); break;
      case 'vline': case 'hline': if (!isNum(v)) bad(); break;
      case 'fn':
        if (!FNS.includes(v)) { errs.push(`item ${i + 1}: unknown fn ${v}`); break; }
        if (v === 'poly' && !(Array.isArray(it.coef) && it.coef.every(isNum))) bad();
        if (v === 'exp' && !(isNum(it.b) && it.b > 0)) bad();
        if (v === 'log' && !(isNum(it.b) && it.b > 0 && it.b !== 1)) bad();
        break;
      case 'seg': case 'marks': if (!Array.isArray(v) || v.length !== 2 || !v.every(isPt)) bad(); break;
      case 'riseRun': if (!Array.isArray(v) || v.length !== 2 || !v.every(isPt) || v[0][0] === v[1][0]) bad(); break;
      case 'path': case 'poly': case 'pts': if (!Array.isArray(v) || !v.length || !v.every(isPt)) bad(); break;
      case 'text': if (!Array.isArray(v) || v.length !== 3 || !isNum(v[0]) || !isNum(v[1]) || typeof v[2] !== 'string') bad(); break;
      case 'angle': if (!v || !isPt(v.at) || !isPt(v.from) || !isPt(v.to)) bad(); break;
      case 'circle': if (!Array.isArray(v) || v.length !== 3 || !v.every(isNum) || v[2] <= 0) bad(); break;
    }
  });
  return errs;
}

// y as a function of x for a {fn} item (NaN outside the domain).
export function fnValue(it, x) {
  const n = (v, d) => isNum(v) ? v : d;
  switch (it.fn) {
    case 'quad': return n(it.a, 1) * (x - n(it.h, 0)) ** 2 + n(it.k, 0);
    case 'poly': return it.coef.reduce((s, c, p) => s + c * x ** p, 0);
    case 'exp': return n(it.a, 1) * it.b ** x + n(it.k, 0);
    case 'log': { const u = x - n(it.h, 0); return u > 0 ? n(it.a, 1) * Math.log(u) / Math.log(it.b) : NaN; }
    case 'sin': return n(it.A, 1) * Math.sin(n(it.B, 1) * (x - n(it.C, 0))) + n(it.D, 0);
    case 'cos': return n(it.A, 1) * Math.cos(n(it.B, 1) * (x - n(it.C, 0))) + n(it.D, 0);
    case 'abs': return n(it.a, 1) * Math.abs(x - n(it.h, 0)) + n(it.k, 0);
  }
  return NaN;
}

// ---------- drawing (browser) ----------
const NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs, kids) {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs || {}).forEach(([k, v]) => { if (v != null && v !== false) e.setAttribute(k, String(v)); });
  (kids || []).forEach(k => e.append(k));
  return e;
}
const fmtTick = v => (Math.abs(v) < 1e-9 ? '0' : String(+v.toFixed(2))).replace('-', '−');

export function graphSvg(g, label) {
  const W = 480, PAD = 36;
  const [x0, x1] = g.x, [y0, y1] = g.y;
  const innerW = W - PAD * 2;
  let innerH = 260;
  if (g.equal) innerH = Math.max(160, Math.min(520, innerW * (y1 - y0) / (x1 - x0)));
  else if (g.h) innerH = g.h;
  const H = innerH + PAD * 2;
  const X = x => PAD + (x - x0) / (x1 - x0) * innerW;
  const Y = y => PAD + (y1 - y) / (y1 - y0) * innerH;
  const axes = g.axes !== false, grid = g.grid !== false && axes;
  const tx = isNum(g.ticks) ? g.ticks : (g.ticks && g.ticks.x) || niceStep(x1 - x0);
  const ty = isNum(g.ticks) ? g.ticks : (g.ticks && g.ticks.y) || niceStep(y1 - y0);

  const my = uid++;
  const svg = s('svg', { class: 'tc-graph', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label || 'Graph' });
  const defs = s('defs');
  ['a', 'b', 'c', 'd'].forEach(c => defs.append(s('marker', { id: 'tc-arrow-' + c + my, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
    [s('path', { d: 'M0,0 L10,5 L0,10 z', class: 'tc-g-fill-' + c })])));
  svg.append(defs);
  const clipId = 'tc-clip' + my;
  svg.append(s('clipPath', { id: clipId }, [s('rect', { x: PAD, y: PAD, width: innerW, height: innerH })]));
  const arrowId = c => `url(#tc-arrow-${c}${my})`;

  if (grid) {
    const gg = s('g', { class: 'tc-g-grid' });
    for (let v = Math.ceil(x0 / tx) * tx; v <= x1 + 1e-9; v += tx) gg.append(s('line', { x1: X(v), y1: PAD, x2: X(v), y2: PAD + innerH }));
    for (let v = Math.ceil(y0 / ty) * ty; v <= y1 + 1e-9; v += ty) gg.append(s('line', { x1: PAD, y1: Y(v), x2: PAD + innerW, y2: Y(v) }));
    svg.append(gg);
  }
  if (axes) {
    const ga = s('g', { class: 'tc-g-axes' });
    const ax = Math.min(Math.max(0, y0), y1), ay = Math.min(Math.max(0, x0), x1);
    ga.append(s('line', { x1: PAD, y1: Y(ax), x2: PAD + innerW, y2: Y(ax) }));
    ga.append(s('line', { x1: X(ay), y1: PAD, x2: X(ay), y2: PAD + innerH }));
    const lab = s('g', { class: 'tc-g-ticks' });
    for (let v = Math.ceil(x0 / tx) * tx; v <= x1 + 1e-9; v += tx) {
      if (Math.abs(v - ay) < 1e-9 && y0 < 0) continue;
      lab.append(s('text', { x: X(v), y: Math.min(Y(ax) + 15, H - 4), 'text-anchor': 'middle' }, [fmtTick(v)]));
    }
    for (let v = Math.ceil(y0 / ty) * ty; v <= y1 + 1e-9; v += ty) {
      if (Math.abs(v - ax) < 1e-9) continue;
      lab.append(s('text', { x: Math.max(X(ay) - 6, 12), y: Y(v) + 4, 'text-anchor': 'end' }, [fmtTick(v)]));
    }
    ga.append(lab);
    if (g.xLabel) ga.append(s('text', { class: 'tc-g-axislabel', x: PAD + innerW, y: Math.min(Y(ax) - 8, H - 4), 'text-anchor': 'end' }, [g.xLabel]));
    if (g.yLabel) ga.append(s('text', { class: 'tc-g-axislabel', x: X(ay) + 8, y: PAD - 10 }, [g.yLabel]));
    svg.append(ga);
  }

  const body = s('g', { 'clip-path': `url(#${clipId})` });
  const top = s('g');
  const text = (x, y, str, cls, anchor) => s('text', { x, y, class: cls || 'tc-g-label', 'text-anchor': anchor || 'start' }, [str]);
  for (const it of g.items) {
    const c = it.c || 'a';
    const stroke = `tc-g-stroke-${c}${it.dash ? ' tc-g-dash' : ''}`;
    if ('line' in it) {
      const [m, b] = it.line;
      body.append(s('line', { class: stroke, x1: X(x0), y1: Y(m * x0 + b), x2: X(x1), y2: Y(m * x1 + b) }));
      if (it.label) { const lx = it.lx != null ? it.lx : x0 + (x1 - x0) * 0.72; top.append(text(X(lx) + 6, Y(m * lx + b) - 8, it.label, 'tc-g-label tc-g-ink-' + c)); }
    } else if ('vline' in it) {
      body.append(s('line', { class: stroke, x1: X(it.vline), y1: PAD, x2: X(it.vline), y2: PAD + innerH }));
      if (it.label) top.append(text(X(it.vline) + 5, PAD + 14, it.label, 'tc-g-label tc-g-ink-' + c));
    } else if ('hline' in it) {
      body.append(s('line', { class: stroke, x1: PAD, y1: Y(it.hline), x2: PAD + innerW, y2: Y(it.hline) }));
      if (it.label) top.append(text(PAD + innerW - 4, Y(it.hline) - 6, it.label, 'tc-g-label tc-g-ink-' + c, 'end'));
    } else if ('fn' in it) {
      const from = it.from != null ? it.from : x0, to = it.to != null ? it.to : x1;
      const n = 240; let d = '', pen = false;
      for (let k = 0; k <= n; k++) {
        const x = from + (to - from) * k / n, y = fnValue(it, x);
        if (!Number.isFinite(y) || y > y1 + (y1 - y0) * 2 || y < y0 - (y1 - y0) * 2) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(y).toFixed(1); pen = true;
      }
      body.append(s('path', { class: stroke, d, fill: 'none' }));
      if (it.label) {
        const lx = it.lx != null ? it.lx : from + (to - from) * 0.78, ly = fnValue(it, lx);
        if (Number.isFinite(ly)) top.append(text(X(lx) + 6, Y(Math.min(Math.max(ly, y0), y1)) - 8, it.label, 'tc-g-label tc-g-ink-' + c));
      }
    } else if ('seg' in it) {
      const [[a, b], [p, q]] = it.seg;
      body.append(s('line', { class: stroke, x1: X(a), y1: Y(b), x2: X(p), y2: Y(q), 'marker-end': it.arrow ? arrowId(c) : null }));
      if (it.label) top.append(text((X(a) + X(p)) / 2 + 6, (Y(b) + Y(q)) / 2 - 6, it.label, 'tc-g-label tc-g-ink-' + c));
    } else if ('path' in it || 'poly' in it) {
      const pts = it.path || it.poly;
      const d = pts.map((p, k) => (k ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join('') + (it.poly ? 'Z' : '');
      body.append(s('path', { class: stroke + (it.fill ? ' tc-g-area-' + c : ''), d, fill: it.fill ? null : 'none' }));
    } else if ('pts' in it) {
      it.pts.forEach(p => {
        top.append(s('circle', { class: 'tc-g-fill-' + c, cx: X(p[0]), cy: Y(p[1]), r: 4.5 }));
        if (p[2]) top.append(text(X(p[0]) + (p[3] === 'l' ? -8 : 8), Y(p[1]) + (p[3] === 'b' ? 18 : -8), p[2], 'tc-g-label', p[3] === 'l' ? 'end' : 'start'));
      });
    } else if ('text' in it) {
      top.append(text(X(it.text[0]), Y(it.text[1]), it.text[2], 'tc-g-label tc-g-ink-' + c, it.anchor));
    } else if ('riseRun' in it) {
      const [[a, b], [p, q]] = it.riseRun;
      top.append(s('path', { class: 'tc-g-stroke-b tc-g-dash', d: `M${X(a)},${Y(b)} L${X(p)},${Y(b)} L${X(p)},${Y(q)}`, fill: 'none' }));
      top.append(text((X(a) + X(p)) / 2, Y(b) + (q >= b ? 16 : -8), 'run = ' + fmtTick(p - a), 'tc-g-label tc-g-ink-b', 'middle'));
      top.append(text(X(p) + 8, (Y(b) + Y(q)) / 2 + 4, 'rise = ' + fmtTick(q - b), 'tc-g-label tc-g-ink-b'));
    } else if ('angle' in it) {
      const { at, from: f, to: t } = it.angle;
      const ax0 = X(at[0]), ay0 = Y(at[1]);
      const a1 = Math.atan2(Y(f[1]) - ay0, X(f[0]) - ax0), a2 = Math.atan2(Y(t[1]) - ay0, X(t[0]) - ax0);
      const r = it.angle.r || 22;
      if (it.angle.right) {
        const u = [Math.cos(a1), Math.sin(a1)], v = [Math.cos(a2), Math.sin(a2)], k = 12;
        top.append(s('path', { class: 'tc-g-stroke-c tc-g-thin', fill: 'none', d: `M${ax0 + u[0] * k},${ay0 + u[1] * k} L${ax0 + (u[0] + v[0]) * k},${ay0 + (u[1] + v[1]) * k} L${ax0 + v[0] * k},${ay0 + v[1] * k}` }));
      } else {
        let da = a2 - a1; while (da <= -Math.PI) da += 2 * Math.PI; while (da > Math.PI) da -= 2 * Math.PI;
        const sweep = da > 0 ? 1 : 0;
        top.append(s('path', { class: 'tc-g-stroke-' + c + ' tc-g-thin', fill: 'none',
          d: `M${ax0 + r * Math.cos(a1)},${ay0 + r * Math.sin(a1)} A${r},${r} 0 0 ${sweep} ${ax0 + r * Math.cos(a1 + da)},${ay0 + r * Math.sin(a1 + da)}` }));
        if (it.angle.label) {
          const mid = a1 + da / 2, lr = r + 14;
          top.append(text(ax0 + lr * Math.cos(mid), ay0 + lr * Math.sin(mid) + 4, it.angle.label, 'tc-g-label tc-g-ink-' + c, 'middle'));
        }
      }
    } else if ('marks' in it) {
      const [[a, b], [p, q]] = it.marks;
      const mx = (X(a) + X(p)) / 2, my = (Y(b) + Y(q)) / 2;
      const ang = Math.atan2(Y(q) - Y(b), X(p) - X(a)), nx = -Math.sin(ang), ny = Math.cos(ang), dx = Math.cos(ang), dy = Math.sin(ang);
      const count = it.n || 1;
      for (let k = 0; k < count; k++) {
        const off = (k - (count - 1) / 2) * 5;
        top.append(s('line', { class: 'tc-g-stroke-c tc-g-thin', x1: mx + dx * off - nx * 6, y1: my + dy * off - ny * 6, x2: mx + dx * off + nx * 6, y2: my + dy * off + ny * 6 }));
      }
    } else if ('circle' in it) {
      const [cx, cy, r] = it.circle;
      body.append(s('ellipse', { class: stroke, fill: 'none', cx: X(cx), cy: Y(cy), rx: Math.abs(X(cx + r) - X(cx)), ry: Math.abs(Y(cy + r) - Y(cy)) }));
    }
  }
  svg.append(body, top);
  return svg;
}
let uid = 0;
function niceStep(span) {
  const raw = span / 8, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
}
