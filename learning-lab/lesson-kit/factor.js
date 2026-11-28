// Lesson kit: polynomials and factoring for Algebra 1 (first used by Wrap Lab).
// Expressions are read by expr.js (never run as code) into exact polynomials
// (a map from each term's letters and powers to a fraction coefficient), so
// one or several letters work: 3x + 6 + 2xy + 4y. Pure; no DOM.
//
//   classify('2x³ + 3x² + x + 8')    -> { polynomial: true, degree: 3, terms: 4, degreeName: 'cubic', termName: 'four terms' }
//   polyOf(text), polyText(P)         exact polynomial ⇄ standard-form text (highest degree first)
//   factorQuadratic(a, b, c)          -> { k, f: [[p, q], [r, s]] } meaning k(px + q)(rx + s), or null if it doesn't factor over the integers
//   quadText(F, 'x')                  -> '(2x + 1)(x + 3)', '(x + 5)²', '3(x − 2)(x + 4)'
//   gcfOf(P)                          -> { k, vars } the greatest common factor of every term
//   checkFactored(spec, raw)          for ask type 'factored': spec = { answer, vars?, traps: [{ expr, code, message }] }
//     equal but not a product → sent back; a factor with a common factor left inside → 'incomplete-gcf';
//     a factor that still factors → 'not-fully-factored'; not equal → "multiply back: your factors give …"

import { Frac } from './frac.js';
import { parse, toPoly, variables, ExprError } from './expr.js';

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sup = n => String(n).split('').map(c => SUP[c]).join('');
const unkey = k => (k ? Object.fromEntries(k.split(',').map(p => { const [v, e] = p.split(':'); return [v, Number(e)]; })) : {});
const degOf = k => Object.values(unkey(k)).reduce((a, b) => a + b, 0);
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const polyOf = src => toPoly(typeof src === 'string' ? parse(src) : src);
export const samePoly = (A, B) => A.size === B.size && [...A].every(([k, c]) => B.has(k) && B.get(k).eq(c));
export const degree = P => (P.size ? Math.max(...[...P.keys()].map(degOf)) : -Infinity);

const DEG = ['constant', 'linear', 'quadratic', 'cubic', 'quartic', 'quintic'];
const TERMS = { 1: 'monomial', 2: 'binomial', 3: 'trinomial', 4: 'four terms' };
export function classify(src) {
  let tree; try { tree = typeof src === 'string' ? parse(src) : src; } catch (e) { return { polynomial: false, reason: 'unreadable' }; }
  const P = toPoly(tree);
  if (!P) return { polynomial: false, reason: 'A polynomial can’t have a variable in a denominator or a negative exponent.' };
  const d = Math.max(0, degree(P)), n = Math.max(1, P.size);
  return { polynomial: true, degree: d, terms: n, degreeName: DEG[d] || `degree ${d}`, termName: TERMS[n] || `${n} terms` };
}

// Standard form: highest degree first; within a degree, letters alphabetically.
const monoText = (k, c, first) => {
  const m = unkey(k), letters = Object.keys(m).sort().map(v => v + (m[v] === 1 ? '' : sup(m[v]))).join('');
  const neg = c.n < 0, a = neg ? c.neg() : c, num = a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
  const body = letters ? (a.eq(1) ? '' : num) + letters : num;
  return first ? (neg ? '−' : '') + body : (neg ? ' − ' : ' + ') + body;
};
export function polyText(P) {
  if (typeof P === 'string') P = polyOf(P);
  if (!P.size) return '0';
  const ks = [...P.keys()].sort((a, b) => degOf(b) - degOf(a) || a.localeCompare(b));
  return ks.map((k, i) => monoText(k, P.get(k), i === 0)).join('');
}
// ASCII version for the kit's own parser (− → -, superscripts kept: the parser reads them).
export const polyAscii = P => polyText(P).replace(/−/g, '-');

// The greatest common factor of every term: an integer and a power of each letter.
export function gcfOf(P) {
  if (typeof P === 'string') P = polyOf(P);
  const cs = [...P.values()];
  if (!cs.length || !cs.every(c => c.d === 1)) return { k: 1, vars: {} };
  let k = cs.reduce((g, c) => gcd(g, c.n), 0);
  if (cs[0].n < 0 && cs.every(c => c.n < 0)) k = -k;   // pull out −1 too when every term is negative
  const ms = [...P.keys()].map(unkey), vars = {};
  for (const v of Object.keys(ms[0] || {})) { const e = Math.min(...ms.map(m => m[v] || 0)); if (e > 0) vars[v] = e; }
  return { k, vars };
}
export const gcfText = G => { const l = Object.keys(G.vars).sort().map(v => v + (G.vars[v] === 1 ? '' : sup(G.vars[v]))).join(''); return (Math.abs(G.k) === 1 && l ? (G.k < 0 ? '−' : '') : String(G.k)) + l; };

// a·x² + b·x + c over the integers (a ≠ 0): the common factor, then the factor-pair search (the ac method).
export function factorQuadratic(a, b, c) {
  if (![a, b, c].every(Number.isInteger) || a === 0) return null;
  let k = gcd(gcd(a, b), c); if (a < 0) k = -k;
  const A = a / k, B = b / k, Cc = c / k;
  if (Cc === 0) return { k, f: [[1, 0], [A, B]] };                 // Ax² + Bx = x(Ax + B)
  for (let p = 1; p <= Math.abs(A); p++) {
    if (A % p) continue;
    const r = A / p, cmax = Math.max(1, Math.abs(Cc));
    for (let q = -cmax; q <= cmax; q++) {
      if (q === 0 || Cc % q) continue;
      const s = Cc / q;
      if (p * s + q * r === B) return { k, f: [[p, q], [r, s]].sort((u, w) => w[0] - u[0] || Math.abs(u[1]) - Math.abs(w[1]) || w[1] - u[1]) };   // steady order: (2x + 1)(x + 3), (x + 3)(x + 4), (x + 5)(x − 5)
    }
  }
  return null;
}
const lin = ([p, q], v) => { const pv = p === 1 ? v : p === -1 ? '−' + v : p + v; return q === 0 ? pv : `${pv} ${q < 0 ? '−' : '+'} ${Math.abs(q)}`; };
export function quadText(F, v = 'x') {
  if (!F) return null;
  const [f1, f2] = F.f, same = f1[0] === f2[0] && f1[1] === f2[1];
  const k = F.k === 1 ? '' : F.k === -1 ? '−' : String(F.k);
  const wrap = f => (f[1] === 0 ? lin(f, v) : `(${lin(f, v)})`);
  if (same) return `${k}(${lin(f1, v)})²`;
  // a monomial factor (x) goes in front: x(3x + 2)
  const order = f1[1] === 0 ? [f1, f2] : f2[1] === 0 ? [f2, f1] : [f1, f2];
  return k + order.map(wrap).join('');
}
export const quadAscii = (F, v = 'x') => quadText(F, v).replace(/−/g, '-');

// The top-level factors of a typed expression: [{ node, power }] and a numeric multiplier, or null for a sum.
function factorsOf(n) {
  const out = []; let k = new Frac(1), ok = true;
  const walk = (x, pw) => {
    if (x.t === 'group') return walk(x.a, pw);
    if (x.t === 'neg') { k = k.mul(-1); return walk(x.a, pw); }
    if (x.t === 'num') { for (let i = 0; i < pw; i++) k = k.mul(x.v); return; }
    if (x.t === 'bin' && x.op === '*') { walk(x.a, pw); walk(x.b, pw); return; }
    if (x.t === 'bin' && x.op === '^') { const e = x.b.t === 'num' && x.b.v.d === 1 ? x.b.v.n : null; if (e === null || e < 1) { ok = false; return; } return walk(x.a, pw * e); }
    if (x.t === 'bin' && (x.op === '+' || x.op === '-')) { out.push({ node: x, power: pw }); return; }
    if (x.t === 'var') { out.push({ node: x, power: pw }); return; }
    ok = false;
  };
  if (n.t === 'bin' && (n.op === '+' || n.op === '-')) return null;
  walk(n, 1);
  return ok ? { k, factors: out } : null;
}
// Does a factor (one bracket) still have something to take out, or still factor?
function factorIssue(P) {
  if (P.size < 2) return null;
  const G = gcfOf(P);
  if (Math.abs(G.k) > 1 || Object.keys(G.vars).length) return 'incomplete-gcf';
  const vs = [...new Set([...P.keys()].flatMap(k => Object.keys(unkey(k))))];
  if (vs.length === 1 && degree(P) === 2) {
    const v = vs[0], c2 = P.get(`${v}:2`), c1 = P.get(`${v}:1`) || new Frac(0), c0 = P.get('') || new Frac(0);
    if ([c2, c1, c0].every(c => c && c.d === 1)) { const F = factorQuadratic(c2.n, c1.n, c0.n); if (F && Math.abs(F.k) === 1) return 'not-fully-factored'; }
  }
  return null;
}
export function checkFactored(spec, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { correct: false, code: 'empty', message: 'Type the factored expression first.' };
  let tree; try { tree = parse(text); } catch (e) { return { correct: false, code: 'unreadable', message: e instanceof ExprError ? e.message : 'I couldn’t read that expression.' }; }
  const allowed = spec.vars || variables(parse(spec.answer)), extra = variables(tree).filter(v => !allowed.includes(v));
  if (extra.length) return { correct: false, code: 'unreadable', message: `This question uses ${allowed.length ? 'only ' + allowed.join(' and ') : 'no letters'}: ${extra.join(', ')} isn’t one of them.` };
  const P = toPoly(tree), T = polyOf(spec.answer);
  if (!P) return { correct: false, code: 'unreadable', message: 'That isn’t a polynomial.' };
  for (const t of spec.traps || []) { try { if (samePoly(P, polyOf(t.expr))) return { correct: false, code: t.code || 'wrong', message: t.message || null }; } catch (e) { /* skip */ } }
  if (samePoly(P, T)) {
    const fs = factorsOf(tree);
    if (!fs) return { correct: false, code: 'unreadable', message: tree.t === 'bin' && [tree.a, tree.b].some(x => x.t === 'bin' && x.op === '*') ? 'Nearly: both parts share a common factor. Factor it out to finish.' : 'That’s equal, but it’s the expanded form: write it as a product of factors.' };
    if (!fs.factors.some(f => f.node.t !== 'var')) return { correct: false, code: 'unreadable', message: 'That’s equal, but write it as a product of factors.' };
    for (const f of fs.factors) {
      if (f.node.t === 'var') continue;
      const issue = factorIssue(toPoly(f.node));
      if (issue === 'incomplete-gcf') return { correct: false, code: 'incomplete-gcf', message: 'Look for the largest factor shared by every term, including the variable part: something common is still inside a bracket.' };
      if (issue === 'not-fully-factored' && spec.complete !== false) return { correct: false, code: 'not-fully-factored', message: 'One of your factors still factors further.' };
    }
    return { correct: true, code: 'correct', message: null };
  }
  // Wrong: multiply it back, and point at the part that differs.
  const mine = polyText(P), want = polyText(T);
  const top = k => [...k.keys()].sort((a, b) => degOf(b) - degOf(a))[0];
  const sameEnds = P.size && T.size && top(P) === top(T) && P.get(top(P)).eq(T.get(top(T))) && (P.get('') || new Frac(0)).eq(T.get('') || new Frac(0));
  const mid = Q => [...Q.keys()].filter(k => k && degOf(k) === 1);
  const flipped = sameEnds && mid(P).length === 1 && mid(T).length === 1 && mid(P)[0] === mid(T)[0] && P.get(mid(P)[0]).eq(T.get(mid(T)[0]).neg());
  if (flipped) return { correct: false, code: 'sign', message: `Multiply back: your factors give ${mine}, not ${want}. Only the middle sign is off: check the signs inside the brackets.` };
  return { correct: false, code: sameEnds ? 'middle-term' : 'wrong', message: `Multiply back: your factors give ${mine}, not ${want}.${sameEnds ? ' The first and last terms match: the middle term comes from adding the cross products.' : ''}` };
}
