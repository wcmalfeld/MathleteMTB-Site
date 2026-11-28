// The Split Report: the analyst-screen charts (dot plot, histogram, box
// plot, scatter). Every position comes from a value computed by the kit's
// engine (lesson-kit/stats.js); the drawing never decides a result.

import { svg } from '../../lesson-kit/dom.js';
import { plot } from '../../lesson-kit/plot.js';
import { tally, summary } from '../../lesson-kit/stats.js';
import { N } from '../logic/questions.js';

const T = (x, y, text, cls, extra) => svg('text', { x, y, class: cls, ...(extra || {}) }, text);

// Dot plot: one row per rider on a shared time axis; repeated times stack.
// rows: [{ label, times, cls }], o: { lo, hi, onDot(rowIndex, runIndex), sel: [row, run] }
export function dotPlotSvg(rows, o = {}) {
  const lo = o.lo ?? 56, hi = o.hi ?? 78, W = 640, L = 90, R = 20, rowH = 96, H = rows.length * rowH + 50;
  const X = v => L + (v - lo) / (hi - lo) * (W - L - R);
  const s = svg('svg', { class: 'spr-chart spr-dots', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': o.label || 'Dot plot of practice times in seconds' });
  for (let v = lo; v <= hi; v += 2) s.append(svg('path', { class: 'spr-grid', d: `M${X(v)} 10 V${H - 40}` }), T(X(v), H - 22, String(v), 'spr-tick', { 'text-anchor': 'middle' }));
  s.append(T(L + (W - L - R) / 2, H - 4, 'Practice time (seconds) · lower is faster', 'spr-axlabel', { 'text-anchor': 'middle' }));
  rows.forEach((r, ri) => {
    const base = 10 + (ri + 1) * rowH - 14, seen = new Map();
    s.append(svg('path', { class: 'spr-axis', d: `M${L} ${base + 8} H${W - R}` }), T(L - 10, base - 20, r.label, 'spr-rowlabel ' + (r.cls || ''), { 'text-anchor': 'end' }));
    r.times.forEach((t, i) => {
      const k = seen.get(t) || 0; seen.set(t, k + 1);
      const on = o.sel && o.sel[0] === ri && o.sel[1] === i;
      const g = svg('g', { class: 'spr-dot ' + (r.cls || '') + (on ? ' is-on' : ''), transform: `translate(${X(t)} ${base - k * 15})` }, svg('circle', { r: 6.5 }));
      if (o.onDot) { g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', `${r.label}, run ${i + 1}: ${t} seconds`); g.setAttribute('aria-pressed', String(!!on)); g.addEventListener('click', () => o.onDot(ri, i)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onDot(ri, i); } }); }
      s.append(g);
    });
  });
  return s;
}

// Histogram: bins [{ from, to, count }] for one or two riders side by side.
export function histogramSvg(series, o = {}) {
  const bins = series[0].bins, W = 640, H = 300, L = 56, R = 16, Tp = 16, B = 56, maxF = Math.max(o.maxF || 0, ...series.flatMap(s => s.bins.map(b => b.count)), 1);
  const pw = W - L - R, ph = H - Tp - B, bw = pw / bins.length, Y = f => Tp + ph - f / maxF * ph;
  const s = svg('svg', { class: 'spr-chart spr-hist', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': o.label || ('Histogram: ' + series.map(se => `${se.label}: ` + se.bins.map(b => `${b.from}–${b.to} ${b.count}`).join(', ')).join('; ')) });
  for (let f = 0; f <= maxF; f++) s.append(svg('path', { class: 'spr-grid', d: `M${L} ${Y(f)} H${W - R}` }), T(L - 8, Y(f) + 4, String(f), 'spr-tick', { 'text-anchor': 'end' }));
  bins.forEach((b, i) => {
    const gap = 8, inner = (bw - gap * 2) / series.length;
    series.forEach((se, j) => {
      const c = se.bins[i].count, x = L + i * bw + gap + j * inner, y = Y(c);
      s.append(svg('rect', { class: 'spr-bar ' + (se.cls || ''), x, y, width: inner - 2, height: Tp + ph - y, style: `--h:${(Tp + ph - y).toFixed(1)}px` }));
      if (c) s.append(T(x + (inner - 2) / 2, y - 6, String(c), 'spr-barval', { 'text-anchor': 'middle' }));
    });
    s.append(T(L + i * bw + bw / 2, Tp + ph + 18, `${b.from}–${b.to}`, 'spr-tick', { 'text-anchor': 'middle' }));
  });
  s.append(svg('path', { class: 'spr-axis', d: `M${L} ${Tp} V${Tp + ph} H${W - R}` }),
    T(L + pw / 2, H - 8, 'Practice time (seconds)', 'spr-axlabel', { 'text-anchor': 'middle' }), T(14, Tp + ph / 2, 'Frequency (runs)', 'spr-axlabel', { 'text-anchor': 'middle', transform: `rotate(-90 14 ${Tp + ph / 2})` }));
  return s;
}

// Side-by-side box plots on one scale. rows: [{ label, times, cls }]; o.onPart(row, part)
export const PARTS = [['min', 'Minimum'], ['q1', 'Q1'], ['median', 'Median'], ['q3', 'Q3'], ['max', 'Maximum']];
export function boxPlotSvg(rows, o = {}) {
  const lo = o.lo ?? 56, hi = o.hi ?? 78, W = 640, L = 90, R = 20, rowH = 90, H = rows.length * rowH + 50;
  const X = v => L + (v - lo) / (hi - lo) * (W - L - R);
  const s = svg('svg', { class: 'spr-chart spr-box', viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': o.label || ('Box plots: ' + rows.map(r => { const S = summary(r.times); return `${r.label}: minimum ${S.min}, Q1 ${S.q1}, median ${S.median}, Q3 ${S.q3}, maximum ${S.max}`; }).join('; ')) });
  for (let v = lo; v <= hi; v += 2) s.append(svg('path', { class: 'spr-grid', d: `M${X(v)} 10 V${H - 40}` }), T(X(v), H - 22, String(v), 'spr-tick', { 'text-anchor': 'middle' }));
  s.append(T(L + (W - L - R) / 2, H - 4, 'Practice time (seconds)', 'spr-axlabel', { 'text-anchor': 'middle' }));
  rows.forEach((r, ri) => {
    const S = summary(r.times), cy = 10 + ri * rowH + rowH / 2, h = 34, g = svg('g', { class: 'spr-boxg ' + (r.cls || '') });
    g.append(T(L - 10, cy + 5, r.label, 'spr-rowlabel ' + (r.cls || ''), { 'text-anchor': 'end' }),
      svg('path', { class: 'spr-whisker', d: `M${X(S.min)} ${cy} H${X(S.q1)} M${X(S.q3)} ${cy} H${X(S.max)} M${X(S.min)} ${cy - 10} V${cy + 10} M${X(S.max)} ${cy - 10} V${cy + 10}` }),
      svg('rect', { class: 'spr-boxrect', x: X(S.q1), y: cy - h / 2, width: Math.max(1, X(S.q3) - X(S.q1)), height: h }),
      svg('path', { class: 'spr-median', d: `M${X(S.median)} ${cy - h / 2} V${cy + h / 2}` }));
    if (o.onPart) PARTS.forEach(([k, name]) => {
      const on = o.sel && o.sel[0] === ri && o.sel[1] === k;
      const hit = svg('g', { class: 'spr-part' + (on ? ' is-on' : ''), role: 'button', tabindex: '0', 'aria-label': `${r.label} ${name}: ${N(S[k])} seconds`, 'aria-pressed': String(!!on), transform: `translate(${X(S[k])} ${cy + h / 2 + 12})` }, svg('circle', { r: 7 }));
      hit.addEventListener('click', () => o.onPart(ri, k)); hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onPart(ri, k); } });
      g.append(hit);
    });
    s.append(g);
  });
  return s;
}

// Scatter on the kit plotter. o: { set: { x, y, xLabel }, hide: [i], highlight: i, line, lines: [{ line, cls }], residuals: line, band: [lo, hi], extra(p) }
export function scatterPlot(o) {
  const xs = o.set.x, ys = o.set.y, show = xs.map((_, i) => !(o.hide || []).includes(i));
  const x0 = o.x ? o.x[0] : Math.max(0, Math.min(...xs) - (xs[1] - xs[0])), x1 = o.x ? o.x[1] : Math.max(...xs) + (xs[1] - xs[0]);
  const y0 = o.y ? o.y[0] : Math.floor((Math.min(...ys) - 4) / 2) * 2, y1 = o.y ? o.y[1] : Math.ceil((Math.max(...ys) + 4) / 2) * 2;
  const lines = [...(o.line ? [{ line: o.line, cls: 'spr-fit' }] : []), ...(o.lines || [])];
  const p = plot({ x: [x0, x1], y: [y0, y1], xLabel: o.set.xLabel || 'x', yLabel: o.yLabel || 'Sector time (s)', xDigits: 0, yDigits: 0, xStep: o.xStep, yStep: o.yStep,
    label: o.label || `Scatter plot, fictional data: ${xs.map((x, i) => show[i] ? `(${x}, ${ys[i]})` : null).filter(Boolean).join(', ')}`,
    bands: o.band ? [{ axis: 'x', from: o.band[0], to: o.band[1], cls: 'spr-band' }] : [],
    series: lines.map(l => ({ points: [[x0, l.line.intercept + l.line.slope * x0], [x1, l.line.intercept + l.line.slope * x1]], cls: l.cls })) });
  if (o.residuals) xs.forEach((x, i) => {
    if (!show[i]) return; const yh = o.residuals.intercept + o.residuals.slope * x, r = ys[i] - yh;
    p.node.append(svg('path', { class: 'spr-res ' + (r > 0 ? 'is-pos' : 'is-neg') + (o.highlight === i ? ' is-on' : ''), d: `M${p.X(x)} ${p.Y(yh)} V${p.Y(ys[i])}` }));
    if (Math.abs(r) > 0.3) p.node.append(T(p.X(x) + 7, (p.Y(yh) + p.Y(ys[i])) / 2 + 4, r > 0 ? '+' : '−', 'spr-res-sign'));
  });
  xs.forEach((x, i) => { if (show[i]) p.node.append(svg('circle', { class: 'spr-pt' + (o.highlight === i ? ' is-on' : '') + (o.flag === i ? ' is-flag' : ''), cx: p.X(x), cy: p.Y(ys[i]), r: 6.5 })); });
  if (o.extra) o.extra(p);
  return p;
}
export { T as svgText, tally };
