// Learn: seven short topics, each with something to look at or try.
import { el, clear, button, frac, v, eq, id } from './dom.js';
import { createProfile } from './profile.js';
import { createGraph } from './graph.js';
import { table } from './question.js';
import { TOPICS } from '../content/lessons.js';
import { fmt, slopeOf, slopeKind, rise, run, gradeFromSlope, angleFromSlope, slopeBetween, kindBetween, reducedFraction, onLine, evaluateLinear, tableRate, clean } from '../logic/slope.js';

const KIND_WORDS = { positive: 'positive', negative: 'negative', zero: 'zero', undefined: 'undefined', none: 'not a slope (same point twice)' };

export function renderLearn(ctx, topicId) {
  const topic = TOPICS.find(t => t.id === topicId) || TOPICS[0];
  ctx.progress.topic(topic.id);
  const i = TOPICS.indexOf(topic);
  const page = el('div', { class: 'sl-learn' });

  const toc = el('nav', { class: 'sl-toc', 'aria-label': 'Learn topics' }, el('ol', null, TOPICS.map((t, k) =>
    el('li', null, el('a', { href: '#learn/' + t.id, 'aria-current': t.id === topic.id ? 'page' : null, class: ctx.progress.state.topics[t.id] ? 'is-done' : null },
      el('span', { class: 'sl-toc-n', 'aria-hidden': 'true' }, ctx.progress.state.topics[t.id] && t.id !== topic.id ? '✓' : String(k + 1)), t.title)))));
  const body = el('section', { class: 'sl-topic', 'aria-labelledby': 'topic-title' },
    el('p', { class: 'sl-kicker' }, `Learn · ${i + 1} of ${TOPICS.length}`),
    el('h2', { id: 'topic-title', class: 'sl-h2' }, topic.title),
    topic.intro ? el('p', { class: 'sl-lede' }, topic.intro) : null);

  const build = { 'rise-run': riseRun, worked, types, 'two-points': twoPoints, graph: fromGraph, table: fromTable, intercept }[topic.kind];
  body.appendChild(build(topic));

  const next = TOPICS[i + 1];
  body.appendChild(el('div', { class: 'sl-pager' },
    i > 0 ? el('a', { class: 'sl-btn sl-btn--quiet', href: '#learn/' + TOPICS[i - 1].id }, '← ' + TOPICS[i - 1].title) : el('span'),
    next ? el('a', { class: 'sl-btn sl-btn--primary', href: '#learn/' + next.id }, 'Next: ' + next.title + ' →')
         : el('a', { class: 'sl-btn sl-btn--primary', href: '#explore' }, 'Go to the Trail Designer →')));
  page.appendChild(toc);
  page.appendChild(body);
  return page;
}

// 1. Rise and run: step through the parts of a trail.
function riseRun(t) {
  const box = el('div');
  box.appendChild(el('dl', { class: 'sl-terms' }, t.terms.map(([a, b]) => [el('dt', null, a), el('dd', null, b)])));
  const profile = createProfile();
  const stepText = el('p', { class: 'sl-step-text', 'aria-live': 'polite' });
  const slopeLine = el('div', { class: 'sl-step-math' });
  let step = 0;
  const show = ['start', 'end', 'run', 'rise', 'direction', 'slope'];
  const back = button('← Back', () => go(step - 1), 'sl-btn--quiet');
  const fwd = button('Next step →', () => go(step + 1), 'sl-btn--primary');
  function go(n) {
    step = Math.max(0, Math.min(t.steps.length - 1, n));
    profile.update({ start: 1000, end: 1120, run: 600, unit: 'ft', show: show.slice(0, step + 1) });
    stepText.textContent = `Step ${step + 1} of ${t.steps.length}: ${t.steps[step][1]}`;
    clear(slopeLine);
    if (step >= 5) slopeLine.appendChild(eq('Slope = ', frac('rise', 'run'), ' = ', frac('120', '600'), ' = 0.2'));
    back.disabled = step === 0; fwd.disabled = step === t.steps.length - 1;
  }
  box.appendChild(el('div', { class: 'sl-card' }, profile.node, stepText, slopeLine, el('div', { class: 'sl-row' }, back, fwd, button('Show all', () => go(t.steps.length - 1), 'sl-btn--quiet'))));
  go(0);
  box.appendChild(el('div', { class: 'sl-rule' }, eq('Slope = ', frac('rise', 'run', 'rise over run'))));
  box.appendChild(el('p', null, t.after));
  return box;
}

// 2. Worked example: slope, grade, and why grade isn't an angle.
function worked(t) {
  const box = el('div');
  box.appendChild(el('div', { class: 'sl-card sl-work' },
    eq(v('m'), ' = ', frac('rise', 'run'), ' = ', frac('120', '600'), ' = 0.2'),
    eq('Grade = 0.2 × 100 = 20%')));
  box.appendChild(el('ul', { class: 'sl-points' }, t.points.map(p => el('li', null, p))));
  // a 20% grade and a 20° angle, both to scale
  const W = 520, H = 190, x0 = 30, y0 = 165, L = 440;
  const NS = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', `0 0 ${W} ${H}`); s.setAttribute('class', 'sl-angles'); s.setAttribute('role', 'img');
  s.setAttribute('aria-label', 'Two lines from the same point, drawn to scale: a 20% grade at about 11.3 degrees, and a steeper 20 degree line, which is about a 36% grade.');
  const mk = (tag, a, txt) => { const n = document.createElementNS(NS, tag); Object.entries(a).forEach(([k, val]) => n.setAttribute(k, val)); if (txt) n.textContent = txt; s.appendChild(n); };
  mk('line', { x1: x0, y1: y0, x2: x0 + L, y2: y0, class: 'sl-axis' });
  const a1 = Math.atan(0.2), a2 = 20 * Math.PI / 180;
  mk('line', { x1: x0, y1: y0, x2: x0 + L * Math.cos(a1), y2: y0 - L * Math.sin(a1), class: 'sl-line' });
  mk('line', { x1: x0, y1: y0, x2: x0 + L * Math.cos(a2), y2: y0 - L * Math.sin(a2), class: 'sl-line sl-line--alt' });
  mk('text', { x: x0 + L * Math.cos(a1) - 4, y: y0 - L * Math.sin(a1) + 20, class: 'sl-leg-label', 'text-anchor': 'end' }, '20% grade ≈ 11.3°');
  mk('text', { x: x0 + L * Math.cos(a2) - 4, y: y0 - L * Math.sin(a2) - 8, class: 'sl-leg-label', 'text-anchor': 'end' }, '20° angle ≈ 36% grade');
  box.appendChild(el('div', { class: 'sl-callout' }, el('p', { class: 'sl-callout-title' }, t.warn), el('p', null, t.angle), s));
  return box;
}

// 3. Four kinds of slope.
function types(t) {
  const box = el('div');
  const grid = el('ul', { class: 'sl-types' });
  t.types.forEach(k => {
    const g = createGraph({ x: { min: -1, max: 5, step: 1 }, y: { min: -1, max: 5, step: 1 }, ticks: false, title: k.name,
      lines: [k.run === 0 ? { vertical: true, x: 2 } : { m: k.rise / k.run, b: k.rise >= 0 ? (k.rise === 0 ? 2 : 0.5) : 4 }],
      describe: () => `${k.name}: ${k.words}` });
    grid.appendChild(el('li', { class: 'sl-type' }, g.node, el('h3', null, k.name), el('p', { class: 'sl-type-ex' }, k.example), el('p', null, k.words)));
  });
  box.appendChild(grid);
  box.appendChild(table(['Mathematical concept', 'Example'], t.types.map(k => [k.name, k.example]), 'The four kinds of slope'));
  box.appendChild(el('div', { class: 'sl-callout' }, el('p', { class: 'sl-callout-title' }, 'Which way is “downhill”?'), el('p', null, t.direction)));
  return box;
}

// Slope working for two points, as elements.
function workFor(p1, p2) {
  const dy = rise(p1.y, p2.y), dx = run(p1.x, p2.x), k = slopeKind(dy, dx);
  const out = [eq(v('m'), ' = ', frac([el('var', null, 'y'), '₂ − ', el('var', null, 'y'), '₁'], [el('var', null, 'x'), '₂ − ', el('var', null, 'x'), '₁'], 'y two minus y one over x two minus x one'),
    ' = ', frac(`${fmt(p2.y)} − ${paren(p1.y)}`, `${fmt(p2.x)} − ${paren(p1.x)}`), ' = ', frac(fmt(dy), fmt(dx)),
    k === 'undefined' || k === 'none' ? '' : ' = ' + fmt(slopeOf(dy, dx)))];
  const words = k === 'undefined' ? 'The run is 0, so the slope is undefined: the line is vertical.'
    : k === 'none' ? 'Both points are the same, so there is no line yet. Pick two different points.'
    : `Rise ${fmt(dy)}, run ${fmt(dx)}: the slope is ${fmt(slopeOf(dy, dx))}, which is ${KIND_WORDS[k]}.`;
  out.push(el('p', { class: 'sl-step-text' }, words));
  return out;
}
const paren = n => n < 0 ? `(${fmt(n)})` : fmt(n);

// 4. Two points: the worked example, then try your own.
function twoPoints(t) {
  const box = el('div');
  const { p1, p2 } = t.example;
  box.appendChild(el('div', { class: 'sl-rule' }, eq(v('m'), ' = ', frac([v('y'), '₂ − ', v('y'), '₁'], [v('x'), '₂ − ', v('x'), '₁'], 'y two minus y one over x two minus x one'))));
  const g = createGraph({ x: { min: 0, max: 8, step: 1, label: 'x' }, y: { min: 0, max: 14, step: 2, label: 'y' }, lines: [{ m: 2, b: 0 }],
    points: [{ ...p1, label: '(2, 4)  point 1' }, { ...p2, label: '(6, 12)  point 2', shape: 'square' }] });
  const steps = [
    'Point 1 is (2, 4): x₁ = 2, y₁ = 4.',
    'Point 2 is (6, 12): x₂ = 6, y₂ = 12.',
    'Change in y (the rise): 12 − 4 = 8.',
    'Change in x (the run): 6 − 2 = 4.',
    'Divide: m = 8 ÷ 4 = 2. For every 1 across, the line goes up 2.'
  ];
  const list = el('ol', { class: 'sl-walk' });
  let n = 0;
  const more = button('Next step →', () => { n++; draw(); }, 'sl-btn--primary');
  function draw() {
    clear(list); steps.slice(0, n + 1).forEach(s => list.appendChild(el('li', null, s)));
    g.update({ riseRun: n >= 3 ? { from: p1, to: p2 } : null });
    more.hidden = n >= steps.length - 1;
  }
  draw();
  box.appendChild(el('div', { class: 'sl-split' }, el('div', null, g.node), el('div', null, el('h3', { class: 'sl-h3' }, 'Worked example'), list, more)));

  box.appendChild(el('h3', { class: 'sl-h3' }, 'Your turn'));
  box.appendChild(el('p', null, t.tryIt));
  const work = el('div', { class: 'sl-step-math', 'aria-live': 'polite' }, el('p', { class: 'sl-step-text' }, 'Pick a first point.'));
  const pg = createGraph({ x: { min: -6, max: 6, step: 1, label: 'x' }, y: { min: -6, max: 6, step: 1, label: 'y' }, title: 'Grid: pick two points',
    pick: { max: 2, snap: 1, labels: ['point 1', 'point 2'], onPick: pts => {
      clear(work);
      if (pts.length < 2) { work.appendChild(el('p', { class: 'sl-step-text' }, `Point 1 is (${fmt(pts[0].x)}, ${fmt(pts[0].y)}). Now pick a second point.`)); pg.update({ riseRun: null, lines: [] }); return; }
      const L = kindBetween(pts[0], pts[1]);
      pg.update({ riseRun: L === 'none' ? null : { from: pts[0], to: pts[1] }, lines: L === 'none' ? [] : [L === 'undefined' ? { vertical: true, x: pts[0].x } : { m: slopeBetween(pts[0], pts[1]), b: clean(pts[0].y - slopeBetween(pts[0], pts[1]) * pts[0].x), style: 'alt' }] });
      workFor(pts[0], pts[1]).forEach(x => work.appendChild(x));
    } } });
  box.appendChild(el('div', { class: 'sl-split' }, el('div', null, pg.node, el('p', { class: 'sl-format' }, 'Click or tap the grid. Keyboard: focus the grid, arrow keys to move, Enter to place.')), work));
  return box;
}

// 5. From a graph: choose a line, pick two points on it.
function fromGraph(t) {
  const box = el('div');
  let line = t.lines[0];
  const work = el('div', { class: 'sl-step-math', 'aria-live': 'polite' });
  const g = createGraph({ x: { min: -5, max: 5, step: 1, label: 'x' }, y: { min: -5, max: 5, step: 1, label: 'y' }, title: 'Grid with a line: pick two points on it',
    lines: [line], pick: { max: 2, snap: 1, labels: ['A', 'B'], onPick } });
  function onPick(pts) {
    clear(work);
    const off = pts.filter(p => !onLine(line, p));
    if (off.length) { work.appendChild(el('p', { class: 'sl-step-text' }, `(${fmt(off[0].x)}, ${fmt(off[0].y)}) isn’t on the line. Pick points where the line passes exactly through a grid corner.`)); g.setPicked(pts.filter(p => onLine(line, p))); return; }
    if (pts.length < 2) { work.appendChild(el('p', { class: 'sl-step-text' }, `A = (${fmt(pts[0].x)}, ${fmt(pts[0].y)}). Pick a second point on the line.`)); g.update({ riseRun: null }); return; }
    g.update({ riseRun: kindBetween(pts[0], pts[1]) === 'none' ? null : { from: pts[0], to: pts[1] } });
    workFor(pts[0], pts[1]).forEach(x => work.appendChild(x));
  }
  const pick = el('div', { class: 'sl-seg', role: 'group', 'aria-label': 'Choose a line' }, t.lines.map(L => {
    const b = button(L.name, () => { line = L; g.setPicked([]); g.update({ lines: [L], riseRun: null }); clear(work); work.appendChild(el('p', { class: 'sl-step-text' }, 'Pick two points on ' + L.name.toLowerCase() + '.')); [...pick.children].forEach(c => c.setAttribute('aria-pressed', c === b ? 'true' : 'false')); }, 'sl-btn--quiet');
    b.setAttribute('aria-pressed', L === line ? 'true' : 'false'); return b;
  }));
  work.appendChild(el('p', { class: 'sl-step-text' }, 'Pick two points on line 1.'));
  box.appendChild(pick);
  box.appendChild(el('div', { class: 'sl-split' }, el('div', null, g.node, el('p', { class: 'sl-format' }, 'Click or tap grid corners on the line. Keyboard: focus the grid, arrow keys, Enter.')), work));
  return box;
}

// 6. From a table: see the changes, then decide if a table is linear.
function fromTable(t) {
  const box = el('div');
  const rows = t.rows.map((r, k) => [...r, k ? '+' + fmt(r[0] - t.rows[k - 1][0]) : '', k ? '+' + fmt(r[1] - t.rows[k - 1][1]) : '']);
  box.appendChild(el('div', { class: 'sl-split' },
    table([...t.headers, 'Change in x', 'Change in y'], rows),
    el('div', null, el('p', null, t.after), eq(v('m'), ' = ', frac('change in y', 'change in x'), ' = ', frac('20', '100'), ' = 0.2'))));
  box.appendChild(el('p', null, t.linearNote));
  const c = t.check, rate = tableRate(c.x.map((x, i) => ({ x, y: c.y[i] })));
  const fb = el('div', { class: 'sl-feedback', 'aria-live': 'polite' });
  const answer = yes => {
    const right = yes === rate.linear;
    clear(fb); fb.className = 'sl-feedback sl-feedback--' + (right ? 'right' : 'wrong');
    fb.appendChild(el('p', null, (right ? 'Right. ' : 'Not quite. ') + `y goes up by ${c.y.slice(1).map((y, i) => fmt(y - c.y[i])).join(', then ')} while x goes up by 1 each time. The change isn’t constant, so this table is not linear.`));
  };
  box.appendChild(el('div', { class: 'sl-card' }, el('h3', { class: 'sl-h3' }, c.prompt),
    table(['x', 'y'], c.x.map((x, i) => [x, c.y[i]])),
    el('div', { class: 'sl-row' }, button('Yes, linear', () => answer(true), 'sl-btn--quiet'), button('No, not linear', () => answer(false), 'sl-btn--quiet')), fb));
  return box;
}

// 7. y = mx + b with sliders.
function intercept(t) {
  const box = el('div');
  box.appendChild(el('div', { class: 'sl-rule' }, eq(v('y'), ' = ', v('m'), v('x'), ' + ', v('b'))));
  box.appendChild(el('dl', { class: 'sl-terms' }, t.parts.map(([a, b]) => [el('dt', null, el('var', null, a)), el('dd', null, b)])));
  let m = 0.5, b = 1;
  const g = createGraph({ x: { min: -6, max: 6, step: 1, label: 'x' }, y: { min: -6, max: 6, step: 1, label: 'y' }, lines: [{ m, b }], points: [{ x: 0, y: b, label: '(0, b)' }] });
  const eqOut = el('p', { class: 'sl-eq sl-eq--big', 'aria-live': 'polite' });
  const said = el('p', { class: 'sl-step-text' });
  const slider = (label, min, max, step, val, set) => {
    const sid = id('s'), out = el('output', { for: sid }, fmt(val));
    const r = el('input', { type: 'range', id: sid, min, max, step, value: val, class: 'sl-range' });
    r.addEventListener('input', () => { set(Number(r.value)); out.textContent = fmt(Number(r.value)); draw(); });
    return el('div', { class: 'sl-control' }, el('label', { for: sid }, label, ' ', out), r);
  };
  function draw() {
    g.update({ lines: [{ m, b }], points: [{ x: 0, y: b, label: '(0, ' + fmt(b) + ')' }] });
    eqOut.textContent = `y = ${m === 0 ? '' : (m === 1 ? '' : m === -1 ? '−' : fmt(m)) + 'x'}${m === 0 ? fmt(b) : b === 0 ? '' : (b > 0 ? ' + ' : ' − ') + fmt(Math.abs(b))}`;
    const k = slopeKind(m, 1);
    said.textContent = `The line crosses the y-axis at ${fmt(b)}. ` + (k === 'zero' ? 'Slope 0: it’s flat.' : `For every 1 step right, it goes ${m > 0 ? 'up' : 'down'} ${fmt(Math.abs(m))}.`);
  }
  box.appendChild(el('div', { class: 'sl-split' }, el('div', null, g.node),
    el('div', null, slider('Slope, m =', -3, 3, 0.25, m, x => { m = x; }), slider('y-intercept, b =', -5, 5, 0.5, b, x => { b = x; }), eqOut, said)));
  draw();
  box.appendChild(el('h3', { class: 'sl-h3' }, 'On a trail'));
  box.appendChild(el('p', null, t.example));
  box.appendChild(table(['Distance x (ft)', 'Elevation y = 0.2x + 1,000 (ft)'], [0, 100, 200, 300, 400, 500].map(x => [x, evaluateLinear(0.2, 1000, x)])));
  box.appendChild(el('p', { class: 'sl-note' }, t.model));
  return box;
}
