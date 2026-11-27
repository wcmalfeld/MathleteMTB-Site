// The Dream Line Project: interactives. Each returns an element; every
// number shown is computed (lesson-kit/expr.js, frac.js, logic/numbers.js),
// never typed in. Controls are keyboard-operable; settings are kept in the
// lab's progress (getData / setData). A page asks its questions before the
// tool that would show their answers.

import { el, svg, put, button, id as uid, reducedMotion } from '../../lesson-kit/dom.js';
import { slider, segs, status } from '../../lesson-kit/controls.js';
import { parse, toText, evaluate, ready, reduce, whyNot, stepOf, operations, kindOf, terms, solveSteps } from '../../lesson-kit/expr.js';
import { Frac, show } from '../../lesson-kit/frac.js';
import { WORKBENCH } from '../logic/workbench.js';
import { CARDS, classify, innermost, reasons, SET_NAMES, NATURAL_NOTE, commutes, associates, ops as numOps } from '../logic/numbers.js';
import { bandOptions, pretty, stepText, showNum } from '../logic/questions.js';

const S = x => show(Frac.of(x)).replace(/^-/, '−');

// ------------------------------------------------------------ tutor settings
export const TUTOR_DEFAULTS = { predict: true, hints: true, reveal: false };
export const tutorOf = P => ({ ...TUTOR_DEFAULTS, ...(P.getData('tutor', {}) || {}) });
// Choosing a challenge from the tutor panel: the next mission page scrolls to it.
export const jump = { target: null };
export function afterRender() {
  if (!jump.target || typeof document === 'undefined') return;
  const t = jump.target; jump.target = null;
  setTimeout(() => { const n = document.getElementById(t); if (n) { n.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' }); n.setAttribute('tabindex', '-1'); n.focus({ preventScroll: true }); } }, 30);
}

// ------------------------------------------------------------ Math Workbench
export function workbench(ctx, key) {
  const W = typeof key === 'string' ? WORKBENCH[key] : key, P = ctx.progress;   // a key into this lab's content, or a content object
  const body = el('div', { class: 'dl-wb-body' });
  const draw = mode => {
    const X = W[mode];
    put(body, mode === 'simple'
      ? [el('p', { class: 'dl-wb-concept' }, X.concept), el('p', null, X.plain), el('p', { class: 'dl-wb-formula' }, X.formula),
        el('dl', { class: 'dl-wb-vars' }, X.vars.map(([a, b]) => el('div', null, el('dt', null, a), el('dd', null, b)))),
        el('p', null, el('b', null, 'Example: '), X.example), el('p', { class: 'ls-small' }, el('b', null, 'In your park: '), X.park)]
      : [el('p', { class: 'dl-wb-formula' }, X.full), el('p', { class: 'dl-wb-sub' }, X.sub), el('ol', { class: 'ms-steps' }, X.steps.map(s => el('li', null, s))),
        X.props.length ? el('ul', { class: 'dl-wb-props' }, X.props.map(s => el('li', null, s))) : null,
        el('p', { class: 'dl-wb-err-h' }, 'Common errors'), el('ul', { class: 'dl-wb-errs' }, X.errors.map(s => el('li', null, s)))]);
  };
  const mode = P.getData('wbMode', 'simple');
  draw(mode);
  return el('details', { class: 'dl-wb' }, el('summary', null, el('span', { class: 'dl-wb-tag' }, 'Math Workbench'), ' ', W.title),
    el('div', { class: 'dl-wb-in' }, segs('Workbench detail', [{ label: 'Simple', value: 'simple' }, { label: 'Advanced', value: 'advanced' }], mode, v => { P.setData('wbMode', v, true); draw(v); }), body));
}

// ------------------------------------------------------------ prediction first
// Commit a prediction, then the calculation unlocks. Predictions are saved
// (and reported) but never graded: a right guess isn't mastery.
export function predict(ctx, pid, { prompt, options, reveal }) {
  const P = ctx.progress, box = el('div', { class: 'dl-predict' });
  function draw() {
    const T = tutorOf(P), got = P.getData('pred:' + pid, null);
    if (!got && T.predict) {
      const name = uid('pred');
      const fs = el('fieldset', { class: 'ls-choices ls-choices--inline' }, el('legend', { class: 'ls-sr' }, prompt),
        options.map(o => { const oid = uid('po'); return el('label', { class: 'ls-choice', for: oid }, el('input', { type: 'radio', id: oid, name, value: o.id }), el('span', null, o.text)); }));
      const msg = el('p', { class: 'ls-small', role: 'status', 'aria-live': 'polite' });
      put(box, el('p', { class: 'dl-predict-h' }, el('span', { class: 'dl-predict-tag' }, 'Predict first'), ' ', prompt), fs,
        el('div', { class: 'ls-actions' }, button('Lock in my prediction', () => {
          const c = fs.querySelector('input:checked'); if (!c) { msg.textContent = 'Choose a prediction first.'; return; }
          const o = options.find(x => x.id === c.value);
          P.setData('pred:' + pid, { choice: o.id, text: o.text, right: o.right === undefined ? null : !!o.right });
          draw(); ctx.refresh();
        }, 'ls-btn--primary')), msg, el('p', { class: 'ls-small' }, 'The calculation unlocks once you commit. Predictions aren’t marked.'));
      return;
    }
    put(box, got ? el('p', { class: 'dl-predict-locked' }, el('span', { class: 'dl-predict-tag' }, 'Your prediction'), ' ', prompt, ' ', el('b', null, got.text))
      : el('p', { class: 'ls-small dl-predict-locked' }, 'Prediction step turned off in tutor mode.'), reveal());
  }
  draw();
  return box;
}
export function predictionStats(P) {
  const all = Object.entries(P.state.data).filter(([k]) => k.startsWith('pred:')).map(([, v]) => v);
  return { made: all.length, judged: all.filter(v => v.right !== null).length, right: all.filter(v => v.right).length };
}

// ------------------------------------------------------------ written responses (tutor review)
export const WRITTEN = {
  'explain-blueprint': 'Explain the blueprint H = 4t + 3b + 5 in your own words',
  'park-description': 'Park description and what its expression means'
};
export function writtenResponse(ctx, wid, { prompt, sample }) {
  const P = ctx.progress, tid = uid('w'), cid = uid('wc');
  const ta = el('textarea', { id: tid, class: 'ls-textarea', rows: 4, placeholder: 'Write a few sentences.' });
  ta.value = P.written(wid);
  ta.addEventListener('change', () => P.write(wid, ta.value));
  const flag = el('input', { type: 'checkbox', id: cid });
  flag.checked = !!P.getData('review:' + wid, false);
  flag.addEventListener('change', () => P.setData('review:' + wid, flag.checked));
  return el('div', { class: 'ls-card ms-ask dl-written' }, el('p', { class: 'ls-kicker' }, 'Short answer · not auto-marked'),
    el('div', { class: 'ls-field ls-field--wide' }, el('label', { for: tid }, prompt), ta),
    el('label', { class: 'dl-check', for: cid }, flag, ' Ask my tutor to review this'),
    el('details', { class: 'ms-explain' }, el('summary', null, 'Compare with a sample response'), el('p', { class: 'ls-p' }, sample)));
}

// ------------------------------------------------------------ bars of contributions (crew-hours and the like)
export function contributionBars(parts, unit) {
  const max = Math.max(...parts.map(p => Math.abs(p[1])), 1e-9), total = parts.reduce((s, p) => s + p[1], 0);
  return el('div', { class: 'dl-bars' }, el('ul', { class: 'dl-hbars' }, parts.map(([label, v, cls]) => el('li', { class: v < 0 ? 'is-neg' : '' },
    el('span', null, label), el('span', { class: 'dl-hbar-track' }, el('span', { class: 'dl-hbar ' + (cls || ''), style: { width: (100 * Math.abs(v) / max).toFixed(1) + '%' } })), el('b', null, S(v))))),
    el('p', { class: 'dl-bars-total' }, 'Total: ', el('b', null, S(total)), ' ' + unit));
}
// The terms of a substituted expression with their values: '4(3) + 3(2) + 5' -> [['4(3)', 12], …]
export function termParts(expr) {
  return terms(parse(expr)).map(({ node, sign }) => { const v = evaluate(node).mul(sign); return [(sign < 0 ? '−' : '') + toText(node, 1), Number(v), v.n < 0 ? 'is-neg' : '']; });
}

// ------------------------------------------------------------ Expression anatomy (Mission 1)
export function anatomyExplorer(ctx) {
  const P = ctx.progress;
  const TOKENS = [['H', 'total'], ['=', null], ['4', 'coef'], ['t', 'var'], ['+', null], ['3', 'coef'], ['b', 'var'], ['+', null], ['5', 'const']];
  const ROLE = {
    var: { label: 'Variables', ids: [3, 6], meaning: 't and b: how many tabletops and berms. They change from park to park.', blocks: ['t', 'b'] },
    coef: { label: 'Coefficients', ids: [2, 5], meaning: '4 and 3: the crew-hours for each tabletop and each berm. They multiply the variables.', blocks: ['t', 'b'] },
    const: { label: 'Constant', ids: [8], meaning: '5: the site preparation. Fixed, whatever you build.', blocks: ['prep'] },
    terms: { label: 'Terms', ids: [2, 3, 5, 6, 8], groups: [[2, 3], [5, 6], [8]], meaning: '4t, 3b and 5: the separate parts, split at each +.', blocks: ['t', 'b', 'prep'] },
    total: { label: 'Total', ids: [0], meaning: 'H: the total estimated crew-hours, the quantity the expression works out.', blocks: ['t', 'b', 'prep'] }
  };
  let mode = P.getData('anatomy', 'var');
  const line = el('p', { class: 'dl-anatomy', 'aria-hidden': 'true' }), read = el('p', { class: 'dl-anatomy-read', role: 'status', 'aria-live': 'polite' }), fig = el('div', { class: 'ms-figure' });
  function blueprint(on) {
    const rows = [['t', 'Tabletops', '4 h each × t'], ['b', 'Berms', '3 h each × b'], ['prep', 'Site preparation', '5 h, fixed']];
    return svg('svg', { class: 'dl-bp', viewBox: '0 0 420 150', role: 'img', 'aria-label': 'Blueprint: ' + rows.filter(r => on.includes(r[0])).map(r => r[1]).join(', ') + ' highlighted' },
      svg('rect', { class: 'dl-bp-bg', x: 0, y: 0, width: 420, height: 150 }),
      rows.map(([k, name, sub], i) => svg('g', { class: 'dl-bp-row' + (on.includes(k) ? ' is-on' : ''), transform: `translate(12 ${12 + i * 44})` },
        svg('rect', { width: 396, height: 36 }), svg('text', { x: 12, y: 23, class: 'dl-bp-name' }, name), svg('text', { x: 384, y: 23, class: 'dl-bp-sub', 'text-anchor': 'end' }, sub))));
  }
  function draw() {
    const R = ROLE[mode];
    put(line, TOKENS.map(([t], i) => el('span', { class: 'dl-tok' + (R.ids.includes(i) ? ' is-on' : '') + (R.groups && R.groups.some(g => g[0] === i) ? ' is-start' : '') + (R.groups && R.groups.some(g => g[g.length - 1] === i) ? ' is-end' : '') }, t)));
    put(read, el('b', null, R.label + ': '), R.meaning);
    put(fig, blueprint(R.blocks));
    P.setData('anatomy', mode, true);
  }
  const pick = segs('Highlight', Object.entries(ROLE).map(([k, r]) => ({ label: r.label, value: k })), mode, v => { mode = v; draw(); });
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, line, fig), el('div', { class: 'ms-lab-panel' }, pick, read,
    el('p', { class: 'ls-sr' }, 'The expression: H = 4t + 3b + 5.')));
}

// ------------------------------------------------------------ the Shaper's Calculation Board (Mission 3)
const OPEN_CLOSE = { '(': ')', '[': ']', '{': '}' };
const KIND_NAME = { exponent: 'Exponent', multiply: 'Multiplication', divide: 'Division', add: 'Addition', subtract: 'Subtraction', negate: 'Opposite' };
export function calcBoard(ctx, B, o = {}) {
  const P = ctx.progress, id = B.id, key = o.key || null, Q = B;
  const start = () => { const t = parse(B.expr); if (B.bar) t.bar = true; return t; };
  let tree = start(), log = [], misses = 0, practice = P.done(id, key);
  const exprBox = el('div', { class: 'dl-board-expr', role: 'group', 'aria-label': 'Choose the operation to do next' });
  const logList = el('ol', { class: 'dl-board-steps', 'aria-label': 'Steps so far' });
  const fb = el('div', { class: 'ls-fb', role: 'status', 'aria-live': 'polite' });
  const hintsEl = el('ol', { class: 'ls-hints', 'aria-label': 'Hints' });
  const actions = el('div', { class: 'ls-actions' });
  const say = (tone, ...ps) => { fb.className = 'ls-fb ls-fb--' + tone; put(fb, ps.filter(Boolean).map(p => el('p', null, p))); };
  const rec = () => P.question(id, key) || { attempts: 0, hints: 0, correct: false, revealed: false };
  const scopeOf = n => (operations(tree).find(x => x.node === n) || {}).scope;
  const label = n => (n.bar ? 'Fraction bar (division)' : (scopeOf(n) && scopeOf(n) !== 'root' ? 'Inside the grouping, ' + KIND_NAME[kindOf(n)].toLowerCase() : KIND_NAME[kindOf(n)]));
  const describe = n => (n.t === 'neg' ? 'the opposite' : n.bar ? 'the fraction bar' : n.op === '^' ? 'the exponent' : { '*': 'the multiplication', '/': 'the division', '+': 'the addition', '-': 'the subtraction' }[n.op]);

  function opBtn(n, text, cls) {
    const aria = n.op === '^' ? 'exponent ' + toText(n.b) : n.bar ? 'divide: the fraction bar' : n.t === 'neg' ? 'opposite' : { '*': 'multiply', '/': 'divide', '+': 'add', '-': 'subtract' }[n.op];
    return el('button', { type: 'button', class: 'dl-op' + (cls ? ' ' + cls : ''), 'aria-label': aria, disabled: tree.t === 'num' ? true : null, onclick: () => choose(n) }, text);
  }
  const strip = n => (n.t === 'group' ? n.a : n);
  function R(n, pp = 0, right = false) {
    if (n.t === 'num') { const s = toText(n); const neg = s.startsWith('−') && pp > 0; return el('span', { class: 'dl-num' + (n.fresh ? ' is-new' : '') }, neg ? '(' + s + ')' : s); }
    if (n.t === 'group') return el('span', { class: 'dl-grp' }, el('span', { class: 'dl-paren' }, n.open), R(n.a), el('span', { class: 'dl-paren' }, OPEN_CLOSE[n.open]));
    if (n.t === 'neg') return el('span', null, opBtn(n, '−'), R(n.a, 3));
    if (n.bar) return el('span', { class: 'dl-frac' }, el('span', { class: 'dl-frac-top' }, R(strip(n.a))), opBtn(n, '', 'dl-frac-bar'), el('span', { class: 'dl-frac-bot' }, R(strip(n.b))));
    if (n.op === '^') return el('span', { class: 'dl-pow' }, R(n.a, 5), el('sup', null, opBtn(n, toText(n.b), 'dl-op--exp')));
    const p = { '+': 1, '-': 1, '*': 2, '/': 2 }[n.op];
    const sym = n.implicit ? '·' : { '*': '×', '/': '÷', '+': '+', '-': '−' }[n.op];
    const inner = el('span', null, R(n.a, p), opBtn(n, sym, n.implicit ? 'dl-op--imp' : ''), R(n.b, p, true));
    return p < pp || (right && p === pp) ? el('span', null, '(', inner, ')') : inner;
  }
  function clearFresh(n) { if (!n) return; if (n.t === 'num') n.fresh = false; clearFresh(n.a); clearFresh(n.b); }
  function apply(n) { const st = stepOf(n), lab = label(n); clearFresh(tree); tree = reduce(tree, n); log.push(lab + ': ' + st.text.replace(/^−\((.*)\)/, '−$1')); return st; }
  function choose(n) {
    if (tree.t === 'num') return;
    if (ready(tree).includes(n)) {
      const st = apply(n);
      if (tree.t === 'num') return finish();
      say('right', `✓ ${st.text}. What’s next?`); draw();
    } else {
      const why = whyNot(tree, n) || { code: 'order', text: 'Not yet.' };
      misses += 1;
      if (!practice) { P.attempt(id, key, `Chose ${describe(n)} too early in ${toText(tree)}`, false, { code: why.code, prompt: Q.prompt, correctAnswer: String(B.answer) }); ctx.refresh(); }
      say('wrong', `Not yet: ${why.text}`, rec().hints < Q.hints.length && tutorOf(P).hints ? 'Have another go, or take a hint.' : 'Have another go.'); draw();
    }
  }
  function finish(revealed) {
    if (!practice && !revealed) { P.attempt(id, key, log.join(' | '), true, { code: 'correct', prompt: Q.prompt, correctAnswer: String(B.answer) }); ctx.refresh(); }
    say(revealed ? 'info' : 'right', revealed ? 'Here’s every step, in order.' : (misses === 0 && !rec().hints && !practice ? 'Right, every step first try: ' : 'Done: ') + `${B.expr} = ${S(B.answer)}.`);
    practice = true; draw();
  }
  function reveal() {
    P.reveal(id, key); ctx.refresh();
    tree = start(); log = []; let guard = 0;
    while (tree.t !== 'num' && guard++ < 50) apply(ready(tree)[0]);
    finish(true);
  }
  function hint() { P.hint(id, key); drawHints(); }
  function drawHints() {
    const n = rec().hints, hs = tutorOf(P).hints ? Q.hints : [];
    put(hintsEl, hs.slice(0, n).map((h, i) => el('li', null, el('b', null, `Hint ${i + 1}: `), h)));
  }
  function draw() {
    put(exprBox, R(tree));
    put(logList, log.map(s => el('li', null, s)));
    drawHints();
    const r = rec(), T = tutorOf(P), done = tree.t === 'num';
    const hs = T.hints ? Q.hints : [];
    put(actions,
      !done && hs.length && r.hints < hs.length && !practice ? button(r.hints ? `Next hint (${hs.length - r.hints} left)` : 'Get a hint', hint, 'ls-btn--quiet') : null,
      !done && !practice && !r.correct && !r.revealed && (T.reveal || misses >= 2 || (hs.length && r.hints >= hs.length)) ? button('Show the solution', reveal, 'ls-btn--quiet') : null,
      done || log.length ? button(done ? 'Replay (practice, not recorded)' : 'Start over', () => { tree = start(); log = []; misses = 0; practice = practice || P.done(id, key); say('info', practice ? 'Practice run: not recorded.' : 'Start again from the top.'); draw(); }, 'ls-btn--quiet') : null);
  }
  if (practice) { const r = rec(); let guard = 0; while (tree.t !== 'num' && guard++ < 50) apply(ready(tree)[0]); say(r.correct ? 'right' : 'info', r.correct ? `You’ve already simplified this one: ${B.expr} = ${S(B.answer)}.` : 'You looked at the solution for this one.'); }
  draw();
  return el('div', { class: 'ls-card ms-ask dl-board', 'data-q': id }, el('p', { class: 'ls-kicker' }, o.kicker || 'Calculation board · ' + Q.level),
    el('p', { class: 'ls-prompt' }, Q.prompt), el('p', { class: 'ls-small' }, 'Tap the operation that should happen next. Grouping symbols aren’t buttons: work inside them.' + (/·/.test(R(start()).textContent) ? ' The dot (·) is the multiplication hidden when a number sits right next to a bracket.' : '')),
    exprBox, logList, actions, hintsEl, fb);
}

// ------------------------------------------------------------ fraction display and crew working sheets
export function fractionDisplay(top, bottom, label) {
  return el('div', { class: 'dl-fraction', role: 'img', 'aria-label': label || `${top} over ${bottom}` }, el('span', { class: 'dl-frac-top' }, top), el('span', { class: 'dl-frac-line', 'aria-hidden': 'true' }), el('span', { class: 'dl-frac-bot' }, bottom));
}
export function crewSheet(m) {
  const t = parse(m.expr), problem = m.bar && t.op === '/' ? fractionDisplay(toText(t.a.t === 'group' ? t.a.a : t.a), toText(t.b.t === 'group' ? t.b.a : t.b)) : el('span', { class: 'dl-crew-expr' }, pretty(m.expr));
  return el('figure', { class: 'dl-crew' }, el('figcaption', null, el('span', { class: 'dl-crew-tag' }, 'Crew working'), ' ', m.crew + '’s calculation'),
    el('div', { class: 'dl-crew-problem' }, problem),
    el('ol', { class: 'dl-crew-lines' }, m.lines.map(l => el('li', null, '= ' + l))));
}

// ------------------------------------------------------------ Elevation mapping (Mission 2)
export function elevationViz(ctx) {
  const P = ctx.progress;
  const PRESETS = [{ label: 'Mapped section', Ei: 2400, dE: -125.5 }, { label: 'A climb', Ei: 2274.5, dE: 60.25 }, { label: 'A connector', Ei: 2150, dE: -85 }];
  let st = P.getData('elev', { p: 0, dE: -125.5 });
  const fig = el('div', { class: 'ms-figure dl-elev-fig' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' });
  const lo = 1800, hi = 2700, Y = v => 330 - (v - lo) / (hi - lo) * 300;
  const sl = slider({ label: 'Signed change ΔE', min: -300, max: 300, step: 0.25, value: st.dE, unit: 'ft', onInput: v => { st.dE = v; draw(); }, describe: v => (v < 0 ? 'a loss of ' + -v : 'a gain of ' + v) + ' feet' });
  function draw() {
    const Ei = Frac.of(PRESETS[st.p].Ei), dE = Frac.of(st.dE), Ef = Ei.add(dE), up = dE.n >= 0;
    const s = svg('svg', { viewBox: '0 0 320 350', role: 'img', 'aria-label': `Elevation scale: start ${S(Ei)} ft, change ${S(dE)} ft, final ${S(Ef)} ft` });
    s.appendChild(svg('path', { class: 'dl-elev-axis', d: `M90 ${Y(hi)} V${Y(lo)}` }));
    for (let v = lo; v <= hi; v += 100) { s.appendChild(svg('path', { class: 'dl-elev-tick', d: `M84 ${Y(v)} H96` })); s.appendChild(svg('text', { class: 'ms-svg-small ms-end', x: 78, y: Y(v) + 4 }, String(v))); }
    s.appendChild(svg('path', { class: 'dl-elev-mark', d: `M90 ${Y(Number(Ei))} H230` }));
    s.appendChild(svg('text', { class: 'ms-svg-label', x: 236, y: Y(Number(Ei)) + 4 }, 'Ei ' + S(Ei)));
    s.appendChild(svg('path', { class: 'dl-elev-arrow ' + (up ? 'is-up' : 'is-down'), d: `M170 ${Y(Number(Ei))} V${Y(Number(Ef))}` }));
    s.appendChild(svg('path', { class: 'dl-elev-head ' + (up ? 'is-up' : 'is-down'), d: up ? `M163 ${Y(Number(Ef)) + 10} L170 ${Y(Number(Ef))} L177 ${Y(Number(Ef)) + 10}` : `M163 ${Y(Number(Ef)) - 10} L170 ${Y(Number(Ef))} L177 ${Y(Number(Ef)) - 10}` }));
    s.appendChild(svg('path', { class: 'dl-elev-final', d: `M90 ${Y(Number(Ef))} H230` }));
    s.appendChild(svg('text', { class: 'ms-svg-label ms-strong', x: 236, y: Y(Number(Ef)) + (up ? -6 : 16) }, 'Ef ' + S(Ef)));
    put(fig, s);
    put(read, el('p', { class: 'ms-live-eq' }, `Ef = ${S(Ei)} + ${dE.n < 0 ? '(' + S(dE) + ')' : S(dE)} = `, el('b', null, S(Ef) + ' ft')),
      el('p', null, up ? 'A positive change is a gain: the final elevation is higher.' : 'A negative change is a loss: adding it subtracts, so the final elevation is lower.'));
    P.setData('elev', st, true);
  }
  const pre = segs('Start', PRESETS.map((p, i) => ({ label: p.label + ' (' + S(p.Ei) + ' ft)', value: i })), st.p, v => { st.p = v; st.dE = PRESETS[v].dE; sl.set(st.dE); draw(); });
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' }, pre, sl.node, read));
}

// ------------------------------------------------------------ Fraction mapper (Mission 2)
export function fractionMapper(ctx) {
  const P = ctx.progress, FR = [[1, 2], [2, 3], [3, 4], [5, 8], [4, 5]];
  let st = P.getData('fracmap', { f: 2, L: 2.4 });
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' });
  const sl = slider({ label: 'Planned network L', min: 0.8, max: 6.4, step: 0.4, value: st.L, unit: 'mi', onInput: v => { st.L = v; draw(); } });
  function draw() {
    const [n, d] = FR[st.f], L = Frac.of(st.L), part = L.div(d), D = part.mul(n), W = 600, w = W / d;
    const s = svg('svg', { viewBox: '0 0 640 120', role: 'img', 'aria-label': `${n} of ${d} equal sections highlighted, each ${S(part)} miles` });
    for (let k = 0; k < d; k++) {
      s.appendChild(svg('rect', { class: 'dl-sec' + (k < n ? ' is-on' : ''), x: 20 + k * w + 2, y: 34, width: w - 4, height: 34 }));
      s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: 20 + k * w + w / 2, y: 90 }, S(part)));
    }
    s.appendChild(svg('text', { class: 'ms-svg-label', x: 20, y: 22 }, `L = ${S(L)} mi in ${d} equal sections`));
    s.appendChild(svg('text', { class: 'ms-svg-label ms-strong', x: 20, y: 112 }, `Mapped: ${n} × ${S(part)} = ${S(D)} mi`));
    put(fig, s);
    put(read, el('p', { class: 'ms-live-eq' }, `D = (${n}/${d})(${S(L)}) = `, el('b', null, S(D) + ' mi')), el('p', { class: 'ls-small' }, `${S(L)} ÷ ${d} = ${S(part)} per section; ${n} sections.`));
    P.setData('fracmap', st, true);
  }
  const fp = segs('Fraction mapped', FR.map(([n, d], i) => ({ label: n + '/' + d, value: i })), st.f, v => { st.f = v; draw(); });
  draw();
  return el('div', { class: 'ms-lab ms-lab--stack' }, fig, el('div', { class: 'ms-lab-panel ms-lab-panel--row' }, el('div', null, fp, sl.node), read));
}

// A strip of decimal segments added end to end.
export function decimalStrip(values, unit) {
  const tot = values.reduce((s, v) => s.add(Frac.of(v)), new Frac(0)), W = 600;
  let x = 20;
  const s = svg('svg', { viewBox: '0 0 640 90', role: 'img', 'aria-label': values.map(S).join(' plus ') + ' equals ' + S(tot) + ' ' + unit });
  values.forEach((v, i) => { const w = W * Number(v) / Number(tot); s.appendChild(svg('rect', { class: 'dl-seg dl-seg--' + (i % 3), x: x + 1, y: 20, width: w - 2, height: 30 })); s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: x + w / 2, y: 40 }, S(v))); x += w; });
  s.appendChild(svg('text', { class: 'ms-svg-label', x: 20, y: 76 }, `${values.map(S).join(' + ')} = ${S(tot)} ${unit}`));
  return el('div', { class: 'ms-figure' }, s);
}

// ------------------------------------------------------------ the challenge sequence (Mission 2, prediction first)
export function challengeCard(ctx, c) {
  const { q, live } = ctx, P = ctx.progress;
  return el('div', { class: 'dl-challenge', id: 'dl-' + c.id },
    el('p', { class: 'dl-level dl-level--' + c.level }, c.level[0].toUpperCase() + c.level.slice(1) + ' · ' + c.skill),
    el('p', { class: 'ls-p' }, c.story),
    el('p', { class: 'dl-formula' }, `${c.letter} = ${pretty(c.rhs)}`, el('span', { class: 'ls-small' }, '   with ' + Object.entries(c.vars).map(([k, v]) => `${k} = ${showNum(v)}`).join(', '))),
    predict(ctx, c.id, { prompt: `Roughly how big will ${c.letter} be?`, options: bandOptions(c), reveal: () => [
      q(c.id + '-sub', { kicker: 'Substitute' }), q(c.id, { kicker: 'Evaluate' }),
      live(() => {
        if (!P.done(c.id)) return null;
        const pr = P.getData('pred:' + c.id, null);
        return el('div', { class: 'dl-reveal' }, el('p', { class: 'ls-kicker' }, 'Worked solution'),
          el('p', { class: 'ms-live-eq' }, `${c.letter} = ${pretty(c.sub)}`), el('ol', { class: 'ms-steps' }, solveSteps(c.sub).map(s => el('li', null, s.text))),
          contributionBars(termParts(c.sub), c.unit),
          pr ? el('p', { class: 'ls-small' }, `You predicted “${pr.text}”: ${pr.right ? 'your estimate was in the right range.' : `the answer, ${showNum(c.answer)}, landed in a different range. What made it bigger or smaller than you expected?`}`) : null);
      })] }));
}

// ------------------------------------------------------------ Inventory markers (Mission 3)
export function markerGroups(ctx) {
  const P = ctx.progress, E = '3(18 + 2²) + 12', ST = solveSteps(E);
  let k = P.getData('markers', 0);
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' }), nav = el('div', { class: 'ls-actions' });
  const WORDS = ['The whole order: three zones, each with 18 boundary markers and a 2-by-2 square of feature markers, plus 12 shared perimeter markers.',
    'Exponent first (inside the brackets): each zone’s 2-by-2 square is 2² = 4 feature markers.', 'Finish the brackets: 18 + 4 = 22 markers in each zone.', 'Multiply: 3 zones × 22 = 66 markers.', 'Add the shared perimeter: 66 + 12 = 78 markers.'];
  function draw() {
    const s = svg('svg', { viewBox: '0 0 760 300', role: 'img', 'aria-label': WORDS[k] });
    for (let z = 0; z < 3; z++) {
      const x0 = 20 + z * 250, on = (k >= 2 && z === 0) || k >= 3;
      const g = svg('g', { class: 'dl-zone' + (on ? ' is-on' : '') });
      g.appendChild(svg('rect', { class: 'dl-zone-box', x: x0, y: 10, width: 220, height: 200 }));
      g.appendChild(svg('text', { class: 'ms-svg-small', x: x0 + 8, y: 26 }, 'Zone ' + (z + 1)));
      const pts = []; for (let i = 0; i < 5; i++) { pts.push([x0 + 30 + i * 40, 40], [x0 + 30 + i * 40, 190]); } for (let i = 0; i < 4; i++) { pts.push([x0 + 14, 62 + i * 36], [x0 + 206, 62 + i * 36]); }
      pts.forEach(([x, y]) => g.appendChild(svg('circle', { class: 'dl-marker', cx: x, cy: y, r: 6 })));
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.appendChild(svg('rect', { class: 'dl-fmarker' + (k >= 1 ? ' is-on' : ''), x: x0 + 88 + i * 28, y: 88 + j * 28, width: 20, height: 20 }));
      s.appendChild(g);
    }
    for (let i = 0; i < 12; i++) s.appendChild(svg('path', { class: 'dl-pmarker' + (k >= 4 ? ' is-on' : ''), d: `M${50 + i * 60} 270 l9 -16 l9 16 Z` }));
    s.appendChild(svg('text', { class: 'ms-svg-small', x: 20, y: 296 }, '12 shared perimeter markers'));
    put(fig, s);
    put(read, el('p', { class: 'ms-live-eq' }, k === 0 ? 'M = ' + pretty(E) : ST[k - 1].text + (ST[k - 1].after !== S(78) ? '   →   ' + ST[k - 1].after : '')), el('p', null, WORDS[k]));
    put(nav, button('← Back', () => { k = Math.max(0, k - 1); draw(); }, 'ls-btn--quiet', { disabled: k === 0 ? true : null }), button(k < 4 ? 'Next step →' : 'Done', () => { k = Math.min(4, k + 1); draw(); }, 'ls-btn--primary', { disabled: k === 4 ? true : null }),
      el('span', { class: 'ls-small' }, `Step ${k} of 4`));
    P.setData('markers', k, true);
  }
  draw();
  return el('div', { class: 'ms-lab ms-lab--stack' }, fig, read, nav);
}

// ------------------------------------------------------------ the number-set diagram (Mission 4)
const REGION = { real: [10, 10, 740, 300], rational: [24, 40, 470, 262], integer: [40, 74, 360, 216], whole: [56, 108, 250, 170], natural: [72, 142, 140, 124], irrational: [520, 40, 216, 262] };
const SLOTS = { natural: [[110, 190], [150, 230]], whole: [[250, 160], [262, 240]], integer: [[340, 130], [350, 250]], rational: [[440, 110], [450, 210], [440, 280]], irrational: [[580, 140], [660, 200], [600, 260]] };
export function numberSetDiagram(ctx, cards = CARDS) {
  const P = ctx.progress;
  let sel = null;
  const box = el('div');
  function draw() {
    const shown = cards.filter(c => P.done('ns-' + c.id));
    const chosen = shown.find(c => c.id === sel);
    const on = chosen ? Object.entries(classify(chosen)).filter(([, v]) => v).map(([k]) => k) : [];
    const s = svg('svg', { viewBox: '0 0 760 320', role: 'img', 'aria-label': 'Nested number sets: natural inside whole inside integers inside rationals inside reals; irrationals are real but not rational. ' + (shown.length ? 'Placed: ' + shown.map(c => c.label + ' in ' + SET_NAMES[innermost(c)]).join(', ') : 'No cards placed yet.') });
    for (const k of ['real', 'rational', 'integer', 'whole', 'natural', 'irrational']) {
      const [x, y, w, h] = REGION[k];
      s.appendChild(svg('rect', { class: 'dl-set dl-set--' + k + (on.includes(k) ? ' is-on' : ''), x, y, width: w, height: h, rx: 14 }));
      s.appendChild(svg('text', { class: 'dl-set-label', x: x + 10, y: y + 20 }, SET_NAMES[k] + (k === 'real' ? ' numbers' : '')));
    }
    const used = {};
    for (const c of shown) {
      const r = innermost(c), i = used[r] = (used[r] || 0) + 1, [x, y] = SLOTS[r][(i - 1) % SLOTS[r].length];
      s.appendChild(svg('g', { class: 'dl-chip' + (c.id === sel ? ' is-on' : ''), transform: `translate(${x} ${y})` }, svg('rect', { x: -26, y: -16, width: 52, height: 30, rx: 6 }), svg('text', { y: 5, 'text-anchor': 'middle' }, c.label)));
    }
    put(box, el('div', { class: 'ms-figure' }, s),
      shown.length ? el('div', { class: 'ls-actions', role: 'group', 'aria-label': 'Explore a placed card' }, shown.map(c => el('button', { type: 'button', class: 'ls-btn ls-btn--quiet dl-card-btn', 'aria-pressed': String(c.id === sel), onclick: () => { sel = sel === c.id ? null : c.id; draw(); } }, c.label))) : el('p', { class: 'ls-small' }, 'Classify a card above and it appears here, in the smallest set that holds it.'),
      chosen ? el('div', { class: 'dl-read', 'aria-live': 'polite' }, el('p', null, el('b', null, chosen.label + ' — ' + chosen.context + '. ')), el('ul', { class: 'dl-reasons' }, reasons(chosen).map(r => el('li', null, r)))) : null,
      el('p', { class: 'ls-small' }, NATURAL_NOTE));
  }
  draw();
  return box;
}

// ------------------------------------------------------------ property demos (Mission 4)
const boxes = (n, cls) => el('span', { class: 'dl-bundle ' + (cls || '') }, Array.from({ length: n }, () => el('span', { class: 'dl-box' })), el('b', null, String(n)));
export function commutativeDemo(ctx) {
  const P = ctx.progress, NUM = { '+': [4, 6], '×': [4, 6], '−': [8, 3], '÷': [12, 4] };
  let st = P.getData('comm', { op: '+', swap: false });
  const vis = el('div', { class: 'dl-demo-vis' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' });
  function draw() {
    const [a, b] = NUM[st.op], [x, y] = st.swap ? [b, a] : [a, b];
    const v1 = numOps.op(st.op, a, b), v2 = numOps.op(st.op, b, a), same = commutes(st.op, a, b);
    put(vis, st.op === '+' ? el('div', { class: 'dl-bundles' }, boxes(x, st.swap ? 'is-b' : 'is-a'), el('span', { class: 'dl-sym' }, '+'), boxes(y, st.swap ? 'is-a' : 'is-b'))
      : st.op === '×' ? el('div', { class: 'dl-array', style: { gridTemplateColumns: `repeat(${y}, 14px)` }, 'aria-hidden': 'true' }, Array.from({ length: x * y }, () => el('span', { class: 'dl-box' })))
        : el('p', { class: 'dl-big' }, `${x} ${st.op} ${y}`));
    put(read, el('p', { class: 'ms-live-eq' }, `${a} ${st.op} ${b} = ${S(v1)}`), el('p', { class: 'ms-live-eq' }, `${b} ${st.op} ${a} = ${S(v2)}`),
      status(same, 'Same result: ' + (st.op === '+' ? 'addition' : 'multiplication') + ' is commutative.', 'Different results: ' + (st.op === '−' ? 'subtraction' : 'division') + ' is not commutative.'),
      st.op === '×' ? el('p', { class: 'ls-small' }, `${x} rows of ${y} equipment boxes: turn the grid and it’s ${y} rows of ${x}.`) : null);
    P.setData('comm', st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, vis), el('div', { class: 'ms-lab-panel' },
    segs('Operation', ['+', '×', '−', '÷'].map(o => ({ label: o, value: o })), st.op, v => { st.op = v; st.swap = false; draw(); }),
    button('Swap the order', () => { st.swap = !st.swap; draw(); }, 'ls-btn--quiet'), read));
}
export function associativeDemo(ctx) {
  const P = ctx.progress, NUM = { '+': [2, 3, 4], '×': [2, 3, 4], '−': [12, 4, 2], '÷': [24, 4, 2] };
  let st = P.getData('assoc', { op: '+', right: false });
  const vis = el('div', { class: 'dl-demo-vis' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' });
  function draw() {
    const [a, b, c] = NUM[st.op], o = st.op, L = numOps.op(o, numOps.op(o, a, b), c), R = numOps.op(o, a, numOps.op(o, b, c)), same = associates(o, a, b, c);
    const pile = (n, inG) => o === '+' ? boxes(n, inG ? 'is-a' : 'is-b') : el('span', { class: 'dl-big' }, String(n));
    put(vis, el('div', { class: 'dl-bundles' }, st.right ? [pile(a, false), el('span', { class: 'dl-sym' }, o), el('span', { class: 'dl-group' }, pile(b, true), el('span', { class: 'dl-sym' }, o), pile(c, true))]
      : [el('span', { class: 'dl-group' }, pile(a, true), el('span', { class: 'dl-sym' }, o), pile(b, true)), el('span', { class: 'dl-sym' }, o), pile(c, false)]));
    put(read, el('p', { class: 'ms-live-eq' + (st.right ? '' : ' ms-in') }, `(${a} ${o} ${b}) ${o} ${c} = ${S(L)}`), el('p', { class: 'ms-live-eq' + (st.right ? ' ms-in' : '') }, `${a} ${o} (${b} ${o} ${c}) = ${S(R)}`),
      status(same, 'Same result: the grouping doesn’t matter for ' + (o === '+' ? 'addition.' : 'multiplication.'), 'Different results: ' + (o === '−' ? 'subtraction' : 'division') + ' isn’t associative.'));
    P.setData('assoc', st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, vis), el('div', { class: 'ms-lab-panel' },
    segs('Operation', ['+', '×', '−', '÷'].map(o => ({ label: o, value: o })), st.op, v => { st.op = v; draw(); }),
    button('Regroup', () => { st.right = !st.right; draw(); }, 'ls-btn--quiet'), read));
}
export function inverseDemo(ctx) {
  const P = ctx.progress;
  let st = P.getData('inv', { kind: 'add', a: 7 });
  const fig = el('div', { class: 'ms-figure' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' });
  const sl = slider({ label: 'The number a', min: 1, max: 10, step: 1, value: st.a, onInput: v => { st.a = v; draw(); } });
  function draw() {
    const a = st.a;
    if (st.kind === 'add') {
      const X = v => 320 + v * 28;
      const s = svg('svg', { viewBox: '0 0 640 130', role: 'img', 'aria-label': `Climb ${a} feet, then a change of −${a} feet: back to 0` });
      s.appendChild(svg('path', { class: 'ms-axis', d: 'M30 90 H610' }));
      for (let v = -10; v <= 10; v += 2) { s.appendChild(svg('path', { class: 'dl-elev-tick', d: `M${X(v)} 85 V95` })); s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: X(v), y: 114 }, String(v))); }
      s.appendChild(svg('path', { class: 'dl-inv-arrow is-up', d: `M${X(0)} 60 H${X(a)}` }));
      s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: X(a / 2), y: 52 }, '+' + a));
      s.appendChild(svg('path', { class: 'dl-inv-arrow is-down', d: `M${X(a)} 74 H${X(0)}` }));
      s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: X(a / 2), y: 32 }, '−' + a + ' (back again)'));
      put(fig, s);
      put(read, el('p', { class: 'ms-live-eq' }, `${a} + (−${a}) = `, el('b', null, '0')), el('p', null, `−${a} is the additive inverse (opposite) of ${a}: an equal and opposite elevation change.`));
    } else {
      const s = svg('svg', { viewBox: '0 0 640 110', role: 'img', 'aria-label': `${a} pieces each 1/${a} of the whole make 1` });
      const w = 600 / a;
      for (let k = 0; k < a; k++) s.appendChild(svg('rect', { class: 'dl-sec is-on', x: 20 + k * w + 2, y: 24, width: w - 4, height: 36 }));
      for (let k = 0; k < a; k++) s.appendChild(svg('text', { class: 'ms-svg-small ms-mid', x: 20 + k * w + w / 2, y: 80 }, '1/' + a));
      s.appendChild(svg('text', { class: 'ms-svg-label', x: 20, y: 102 }, `${a} × (1/${a}) = 1 whole`));
      put(fig, s);
      put(read, el('p', { class: 'ms-live-eq' }, `${a} × (1/${a}) = `, el('b', null, '1')), el('p', null, `1/${a} is the reciprocal (multiplicative inverse) of ${a}.`),
        el('p', { class: 'ls-small' }, 'Zero has no reciprocal: 0 × anything is 0, never 1.'));
    }
    P.setData('inv', st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, fig), el('div', { class: 'ms-lab-panel' },
    segs('Inverse', [{ label: 'Additive (opposite)', value: 'add' }, { label: 'Multiplicative (reciprocal)', value: 'mult' }], st.kind, v => { st.kind = v; draw(); }), sl.node, read));
}
export function distributiveDemo(ctx) {
  const P = ctx.progress;
  let st = P.getData('dist', { n: 5, view: 'kits' });
  const vis = el('div', { class: 'dl-demo-vis' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' });
  const sl = slider({ label: 'Construction kits (builders)', min: 1, max: 8, step: 1, value: st.n, onInput: v => { st.n = v; draw(); } });
  function draw() {
    const n = st.n, split = st.view === 'split';
    put(vis, el('div', { class: 'dl-kits' + (split ? ' is-split' : '') }, Array.from({ length: n }, (_, k) => el('span', { class: 'dl-kit' },
      el('span', { class: 'dl-flag' }), el('span', { class: 'dl-flag' }), el('span', { class: 'dl-mk' }), el('span', { class: 'dl-mk' }), el('span', { class: 'dl-mk' })))));
    put(read, split ? [el('p', { class: 'ms-live-eq' }, `${n}(2) + ${n}(3) = ${2 * n} + ${3 * n} = `, el('b', null, String(5 * n))), el('p', null, `Count all the flags (gold), then all the markers (blue): ${2 * n} flags and ${3 * n} markers.`)]
      : [el('p', { class: 'ms-live-eq' }, `${n}(2 + 3) = ${n}(5) = `, el('b', null, String(5 * n))), el('p', null, `Count whole kits: ${n} kits of 5 items.`)],
      el('p', { class: 'ls-small' }, `With a variable: n(2 + 3) = 2n + 3n = 5n. Every kit gets both the flags and the markers.`));
    P.setData('dist', st, true);
  }
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, vis), el('div', { class: 'ms-lab-panel' }, sl.node,
    segs('Count', [{ label: 'Whole kits', value: 'kits' }, { label: 'Flags, then markers', value: 'split' }], st.view, v => { st.view = v; draw(); }), read));
}
export function likeTermsDemo(ctx) {
  const P = ctx.progress;
  let st = P.getData('like', { tiles: ['t', 't', 't', 'b', 'b', 't', 't'], sorted: false });
  const vis = el('div', { class: 'dl-demo-vis' }), read = el('div', { class: 'dl-read', 'aria-live': 'polite' });
  const runs = list => { const out = []; for (const x of list) { if (out.length && out[out.length - 1][0] === x) out[out.length - 1][1]++; else out.push([x, 1]); } return out; };
  const termStr = ([x, k]) => (k === 1 ? '' : k) + x;
  function draw() {
    const shown = st.sorted ? [...st.tiles].sort().reverse() : st.tiles;
    const t = st.tiles.filter(x => x === 't').length, b = st.tiles.length - t;
    put(vis, el('div', { class: 'dl-tiles' }, shown.map(x => el('span', { class: 'dl-tile dl-tile--' + x }, x))));
    const simple = [t ? termStr(['t', t]) : null, b ? termStr(['b', b]) : null].filter(Boolean).join(' + ') || '0';
    put(read, el('p', { class: 'ms-live-eq' }, 'As placed: ' + (runs(st.tiles).map(termStr).join(' + ') || '0')), el('p', { class: 'ms-live-eq' }, 'Like terms combined: ', el('b', null, simple)),
      el('p', { class: 'ls-small' }, 'Tabletops (t) only combine with tabletops, berms (b) with berms. 3t + 2b stays as it is: it’s not 5tb.'));
    P.setData('like', st, true);
  }
  const add = x => () => { if (st.tiles.length < 14) st.tiles.push(x); draw(); };
  const take = x => () => { const i = st.tiles.lastIndexOf(x); if (i >= 0) st.tiles.splice(i, 1); draw(); };
  draw();
  return el('div', { class: 'ms-lab' }, el('div', { class: 'ms-lab-visual' }, vis), el('div', { class: 'ms-lab-panel' },
    el('div', { class: 'ls-actions' }, button('+ t (tabletop)', add('t'), 'ls-btn--quiet'), button('− t', take('t'), 'ls-btn--quiet'), button('+ b (berm)', add('b'), 'ls-btn--quiet'), button('− b', take('b'), 'ls-btn--quiet')),
    button('Sort into like terms', () => { st.sorted = !st.sorted; draw(); }, 'ls-btn--quiet'), read));
}
export function identityDemo() {
  return el('div', { class: 'dl-ident' },
    el('div', null, el('p', { class: 'dl-big' }, '8 + 0 = 8'), el('div', { class: 'dl-bundles' }, boxes(8, 'is-a'), el('span', { class: 'dl-sym' }, '+'), el('span', { class: 'dl-bundle' }, el('b', null, '0'))), el('p', { class: 'ls-small' }, 'Adding an empty pile changes nothing: 0 is the additive identity.')),
    el('div', null, el('p', { class: 'dl-big' }, '8 × 1 = 8'), el('div', { class: 'dl-bundles' }, boxes(8, 'is-b'), el('span', { class: 'dl-sym' }, '× 1')), el('p', { class: 'ls-small' }, 'One group of 8 is still 8: 1 is the multiplicative identity.')));
}
