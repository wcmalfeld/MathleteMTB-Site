// Uplift: the systems engine. Two linear equations a·x + b·y = c in exact
// fractions (the kit's frac.js); equations typed as text are read by the
// kit's equation.js (no eval). Classification comes from the equations'
// structure (the determinant and the augmented ratios), never from a failed
// numerical solve. Pure; no DOM.
//
//   std('60x + 90y = 1260') -> { a, b, c }            solve(e1, e2) -> { kind: 'one', x, y } | { kind: 'none' } | { kind: 'infinite' }
//   satisfies(e, x, y), check(e1, e2, x, y)            eqText(e, 'x', 'y') -> '60x + 90y = 1260'
//   substitutionSteps(e1, e2, v, from)                  eliminationSteps(e1, e2, v)  -> [{ text, note }]
//   mixture(), rateMeet(), breakEven()                  application helpers, all exact

import { Frac, show } from '../../lesson-kit/frac.js';
import { lineOf } from '../../lesson-kit/equation.js';

export { Frac };
export const F = x => (x instanceof Frac ? x : typeof x === 'string' ? Frac.parse(x) : Frac.of(x));
export const S = x => show(F(x)).replace(/^-/, '−');
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

export const E = (a, b, c) => ({ a: F(a), b: F(b), c: F(c) });
// y = mx + b  ->  −m·x + 1·y = b
export const fromSlope = (m, b) => E(F(m).neg(), 1, b);
export function std(text, x = 'x', y = 'y') {
  const L = lineOf(text, x, y);
  if (!L) return null;
  return L.vertical !== undefined ? E(1, 0, L.vertical) : fromSlope(L.m, L.b);
}
const det = (e1, e2) => e1.a.mul(e2.b).sub(e2.a.mul(e1.b));
export function solve(e1, e2) {
  const D = det(e1, e2);
  if (!D.zero) return { kind: 'one', x: e1.c.mul(e2.b).sub(e2.c.mul(e1.b)).div(D), y: e1.a.mul(e2.c).sub(e2.a.mul(e1.c)).div(D) };
  // Same direction: the same line exactly when the augmented rows are proportional too.
  const same = e1.a.mul(e2.c).sub(e2.a.mul(e1.c)).zero && e1.b.mul(e2.c).sub(e2.b.mul(e1.c)).zero;
  return { kind: same ? 'infinite' : 'none' };
}
export const satisfies = (e, x, y) => e.a.mul(F(x)).add(e.b.mul(F(y))).eq(e.c);
export const check = (e1, e2, x, y) => ({ first: satisfies(e1, x, y), second: satisfies(e2, x, y), both: satisfies(e1, x, y) && satisfies(e2, x, y) });
export const KIND_TEXT = { one: 'One solution', none: 'No solution', infinite: 'Infinitely many solutions' };

// '60x + 90y = 1260'; coefficients of ±1 drop the 1; zero terms disappear.
export function lhsText(e, x = 'x', y = 'y') {
  const parts = [];
  for (const [k, v] of [[e.a, x], [e.b, y]]) {
    if (k.zero) continue;
    const abs = k.n < 0 ? k.neg() : k, coef = abs.eq(1) ? '' : S(abs);
    parts.push({ neg: k.n < 0, t: coef + v });
  }
  if (!parts.length) return '0';
  return parts.map((p, i) => (i === 0 ? (p.neg ? '−' : '') + p.t : (p.neg ? ' − ' : ' + ') + p.t)).join('');
}
export const eqText = (e, x = 'x', y = 'y') => `${lhsText(e, x, y)} = ${S(e.c)}`;
// For the kit's parser: ASCII minus.
export const eqAscii = (e, x = 'x', y = 'y') => eqText(e, x, y).replace(/−/g, '-');
export const scale = (e, k) => E(e.a.mul(F(k)), e.b.mul(F(k)), e.c.mul(F(k)));
export const addEq = (e1, e2) => E(e1.a.add(e2.a), e1.b.add(e2.b), e1.c.add(e2.c));
export const subEq = (e1, e2) => E(e1.a.sub(e2.a), e1.b.sub(e2.b), e1.c.sub(e2.c));
export const pointText = (x, y) => `(${S(x)}, ${S(y)})`;

// The variable that is easiest to isolate: a coefficient of ±1 (fewest fractions).
export function easiestIsolation(e1, e2) {
  const opts = [];
  [[e1, 1], [e2, 2]].forEach(([e, n]) => { for (const v of ['x', 'y']) { const k = e[v === 'x' ? 'a' : 'b']; if (!k.zero) opts.push({ from: n, v, k, unit: Math.abs(Number(k)) === 1 }); } });
  return opts.find(o => o.unit) || opts[0];
}
// v alone from equation `e`: v = (c − other·w) / k, as { k0, kw } meaning v = k0 + kw·w
export function isolate(e, v) {
  const k = v === 'x' ? e.a : e.b, o = v === 'x' ? e.b : e.a;
  return { k0: e.c.div(k), kw: o.neg().div(k) };
}
// k0 + kw·w, written the natural way round: '4y − 2', '18 − y', '−2y'
const exprText = (k0, kw, w) => {
  if (kw.zero) return S(k0);
  const abs = kw.n < 0 ? kw.neg() : kw, term = (abs.eq(1) ? '' : S(abs)) + w;
  if (k0.zero) return (kw.n < 0 ? '−' : '') + term;
  return kw.n < 0 ? `${S(k0)} − ${term}` : `${term} ${k0.n < 0 ? '−' : '+'} ${S(k0.n < 0 ? k0.neg() : k0)}`;
};
export const isolatedText = (e, v, x = 'x', y = 'y') => { const I = isolate(e, v); return `${v === 'x' ? x : y} = ${exprText(I.k0, I.kw, v === 'x' ? y : x)}`; };

// Substitution, step by step: isolate v in equation `from` (1 or 2), substitute into the other.
// A sum of signed terms: [['', 1080], ['y', -60], ['y', 90]] -> '1080 − 60y + 90y'
function terms(list) {
  const out = list.filter(([, k]) => !F(k).zero).map(([v, k]) => { k = F(k); const abs = k.n < 0 ? k.neg() : k; return { neg: k.n < 0, t: v ? (abs.eq(1) ? '' : S(abs)) + v : S(abs) }; });
  if (!out.length) return '0';
  return out.map((p, i) => (i === 0 ? (p.neg ? '−' : '') + p.t : (p.neg ? ' − ' : ' + ') + p.t)).join('');
}
export function substitutionSteps(e1, e2, v, from, names = { x: 'x', y: 'y' }) {
  const [A, B] = from === 1 ? [e1, e2] : [e2, e1], w = v === 'x' ? 'y' : 'x', I = isolate(A, v);
  const kv = v === 'x' ? B.a : B.b, kw = v === 'x' ? B.b : B.a, N = n => names[n];
  const steps = [{ text: `${N(v)} = ${exprText(I.k0, I.kw, N(w))}`, note: `Isolate ${N(v)} in equation ${from}.` }];
  // the other equation, in its own term order, with v replaced by the bracket
  const vPart = `${kv.eq(1) ? '' : kv.eq(-1) ? '−' : S(kv)}(${exprText(I.k0, I.kw, N(w))})`;
  const wPart = kw.zero ? null : terms([[N(w), kw]]);
  const order = v === 'x' ? [vPart, wPart] : [wPart, vPart];
  const joined = order.filter(Boolean).map((t, i) => (i === 0 ? t : t.startsWith('−') ? ' − ' + t.slice(1) : ' + ' + t)).join('');
  steps.push({ text: `${joined} = ${S(B.c)}`, note: `Substitute into equation ${from === 1 ? 2 : 1}, in brackets.` });
  const dv = [['', kv.mul(I.k0)], [N(w), kv.mul(I.kw)]], dw = [[N(w), kw]];
  if (!kv.eq(1)) steps.push({ text: `${terms(v === 'x' ? [...dv, ...dw] : [...dw, ...dv])} = ${S(B.c)}`, note: 'Distribute.' });
  const cw = kv.mul(I.kw).add(kw), cc = kv.mul(I.k0);
  steps.push({ text: `${terms([[N(w), cw], ['', cc]])} = ${S(B.c)}`, note: 'Combine like terms.' });
  const R = solve(e1, e2);
  if (cw.zero) { steps[steps.length - 1].note = R.kind === 'infinite' ? `${S(cc)} = ${S(B.c)} is always true: infinitely many solutions.` : `${S(cc)} = ${S(B.c)} is never true: no solution.`; return { steps, result: R }; }
  const wv = B.c.sub(cc).div(cw);
  steps.push({ text: `${N(w)} = ${S(wv)}`, note: `Solve for ${N(w)}.` });
  const vv = I.k0.add(I.kw.mul(wv));
  steps.push({ text: `${N(v)} = ${S(vv)}`, note: `Back-substitute into ${N(v)} = ${exprText(I.k0, I.kw, N(w))}.` });
  return { steps, result: R };
}
// Elimination of v: the smallest whole multipliers that make v's coefficients opposites.
export function multipliersFor(e1, e2, v) {
  const p = Number(v === 'x' ? e1.a : e1.b), q = Number(v === 'x' ? e2.a : e2.b);
  if (!Number.isInteger(p) || !Number.isInteger(q) || !p || !q) return null;
  const g = gcd(p, q); let k1 = q / g, k2 = -p / g;
  if (k1 < 0) { k1 = -k1; k2 = -k2; }
  return [k1, k2];
}
export function eliminationSteps(e1, e2, v, names = { x: 'x', y: 'y' }) {
  const M = multipliersFor(e1, e2, v); if (!M) return null;
  let [k1, k2] = M; const w = v === 'x' ? 'y' : 'x', N = n => names[n];
  // keep the surviving coefficient positive (subtract equation 1 from 2 rather than 2 from 1)
  { const s0 = addEq(scale(e1, k1), scale(e2, k2)), c0 = w === 'x' ? s0.a : s0.b; if (c0.n < 0) { k1 = -k1; k2 = -k2; } }
  const A = scale(e1, k1), B = scale(e2, k2), sum = addEq(A, B);
  const t = e => eqText(e, N('x'), N('y'));
  const steps = [];
  if (k1 === 1 && k2 === -1) steps.push({ text: `(${t(e1)}) − (${t(e2)})`, note: `The ${N(v)}-terms already match: subtract equation 2 from equation 1.` });
  else if (k1 === -1 && k2 === 1) steps.push({ text: `(${t(e2)}) − (${t(e1)})`, note: `The ${N(v)}-terms already match: subtract equation 1 from equation 2.` });
  else if (k1 === 1 && k2 === 1) steps.push({ text: `(${t(e1)}) + (${t(e2)})`, note: `The ${N(v)}-terms are already opposites: add.` });
  else { steps.push({ text: `${k1 === 1 ? '' : '×' + S(k1) + ':  '}${t(A)}`, note: k1 === 1 ? 'Keep equation 1.' : `Multiply every term of equation 1 by ${S(k1)}.` }, { text: `${k2 === 1 ? '' : '×' + S(k2) + ':  '}${t(B)}`, note: k2 === 1 ? 'Keep equation 2.' : `Multiply every term of equation 2 by ${S(k2)}.` }); }
  steps.push({ text: t(sum), note: Math.abs(k1) === 1 && Math.abs(k2) === 1 ? `The ${N(v)}-terms cancel.` : `Add: the ${N(v)}-terms cancel.` });
  steps.multipliers = [k1, k2];
  const R = solve(e1, e2);
  const kw = w === 'x' ? sum.a : sum.b;
  if (kw.zero) { steps[steps.length - 1].note = R.kind === 'infinite' ? 'Both variables cancel and 0 = 0 is always true: infinitely many solutions.' : `Both variables cancel and 0 = ${S(sum.c)} is never true: no solution.`; return { steps, multipliers: [k1, k2], result: R }; }
  const wv = sum.c.div(kw);
  steps.push({ text: `${N(w)} = ${S(wv)}`, note: `Solve for ${N(w)}.` });
  const back = e1, kv = v === 'x' ? back.a : back.b, kk = w === 'x' ? back.a : back.b, vv = back.c.sub(kk.mul(wv)).div(kv);
  steps.push({ text: `${N(v)} = ${S(vv)}`, note: 'Substitute back into equation 1.' });
  return { steps, multipliers: [k1, k2], result: R };
}

// ---------- applications (all exact)
// Mixture: total volume T of a target percent p from stockpiles at pa% and pb%.
export function mixture({ total, target, pa, pb }) {
  const e1 = E(1, 1, total), e2 = E(F(pa).div(100), F(pb).div(100), F(total).mul(F(target)).div(100));
  return { e1, e2, ...solve(e1, e2) };
}
export function blend(xa, xb, pa, pb) {
  const tot = F(xa).add(F(xb)), clay = F(xa).mul(F(pa)).div(100).add(F(xb).mul(F(pb)).div(100));
  return { total: tot, clay, sand: tot.sub(clay), pct: tot.zero ? null : clay.div(tot).mul(100) };
}
// Two crews (or riders): D = d0 + r·t each; when do they meet?
export function rateMeet(a, b) {
  const dr = F(a.rate).sub(F(b.rate));
  if (dr.zero) return { kind: F(a.start).eq(F(b.start)) ? 'infinite' : 'none' };
  const t = F(b.start).sub(F(a.start)).div(dr);
  return { kind: 'one', t, D: F(a.start).add(F(a.rate).mul(t)) };
}
// Two pricing plans C = fee + rate·r.
export function breakEven(p, q) { const R = rateMeet({ start: p.fee, rate: p.rate }, { start: q.fee, rate: q.rate }); return R.kind === 'one' ? { kind: 'one', r: R.t, C: R.D } : R; }
export const cost = (plan, r) => F(plan.fee).add(F(plan.rate).mul(F(r)));
