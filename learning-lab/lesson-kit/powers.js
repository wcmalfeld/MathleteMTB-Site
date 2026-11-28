// Lesson kit: single-term (monomial) algebra for exponent rules. A typed
// expression like (2x)³, x⁵/x² or x⁻² is read by expr.js (never run as code)
// and reduced to an exact coefficient times a power of each letter, with
// integer exponents. 0 to a zero or negative power is refused, not treated
// as 1; dividing by zero is refused. Pure; no DOM.
//
//   mono('(2x)^3')                 -> { k: Frac 8, p: { x: 3 } }       (throws PowerError for 0⁰, 0⁻ⁿ, ÷ 0)
//   monoEq(a, b)                   -> same coefficient and the same power of every letter
//   monoText(m)                    -> '8x³', '1/x⁶', '9a²'               (positive exponents)
//   formOf(tree)                   -> what's left to simplify: { repeated, grouped, numberPower, zeroPower, power1, negative, sum, numbers }
//   checkMonomial(spec, raw)       for ask type 'monomial': spec = { answer, vars?, positive?, traps: [{ expr, code, message }] }

import { Frac } from './frac.js';
import { parse, variables, ExprError } from './expr.js';

export class PowerError extends Error {}
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const sup = n => String(n).split('').map(c => SUP[c] || c).join('');
export function fpow(f, e) {
  f = Frac.of(f);
  if (!Number.isInteger(e)) throw new PowerError('Only whole-number exponents are exact here.');
  if (e === 0) return new Frac(1);
  if (e < 0) { if (f.zero) throw new PowerError('Dividing by zero isn’t defined.'); return new Frac(1).div(fpow(f, -e)); }
  let r = new Frac(1); for (let i = 0; i < e; i++) r = r.mul(f); return r;
}
const intOf = n => {
  if (n.t === 'group') return intOf(n.a);
  if (n.t === 'neg') { const v = intOf(n.a); return v === null ? null : -v; }
  if (n.t === 'num' && n.v.d === 1) return n.v.n;
  return null;
};
const clean = p => Object.fromEntries(Object.entries(p).filter(([, e]) => e !== 0));
export function mono(src) {
  const n = typeof src === 'string' ? parse(src) : src;
  const go = n => {
    if (n.t === 'num') return { k: n.v, p: {} };
    if (n.t === 'var') return { k: new Frac(1), p: { [n.name]: 1 } };
    if (n.t === 'group') return go(n.a);
    if (n.t === 'neg') { const m = go(n.a); return m && { k: m.k.neg(), p: m.p }; }
    if (n.t !== 'bin') return null;
    if (n.op === '+' || n.op === '-') return null;
    if (n.op === '^') {
      const e = intOf(n.b); if (e === null) throw new PowerError('This lab uses whole-number exponents only.');
      const b = go(n.a); if (!b) return null;
      if (b.k.zero && !Object.keys(b.p).length && e <= 0) throw new PowerError(e === 0 ? '0⁰ isn’t defined: the zero-exponent rule needs a nonzero base.' : 'Zero to a negative power would divide by zero.');
      return { k: fpow(b.k, e), p: clean(Object.fromEntries(Object.entries(b.p).map(([v, x]) => [v, x * e]))) };
    }
    const a = go(n.a), c = go(n.b); if (!a || !c) return null;
    if (n.op === '*') { const p = { ...a.p }; for (const [v, x] of Object.entries(c.p)) p[v] = (p[v] || 0) + x; return { k: a.k.mul(c.k), p: clean(p) }; }
    if (n.op === '/') { if (c.k.zero) throw new PowerError('Dividing by zero isn’t defined.'); const p = { ...a.p }; for (const [v, x] of Object.entries(c.p)) p[v] = (p[v] || 0) - x; return { k: a.k.div(c.k), p: clean(p) }; }
    return null;
  };
  return go(n);
}
export function monoEq(a, b) {
  const A = typeof a === 'string' ? mono(a) : a, B = typeof b === 'string' ? mono(b) : b;
  if (!A || !B || !A.k.eq(B.k)) return false;
  const ks = new Set([...Object.keys(A.p), ...Object.keys(B.p)]);
  return [...ks].every(v => (A.p[v] || 0) === (B.p[v] || 0));
}
const frac = f => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);
export function monoText(m) {
  if (typeof m === 'string') m = mono(m);
  const vs = Object.keys(m.p).sort(), pw = (v, e) => v + (e === 1 ? '' : sup(e));
  const neg = m.k.n < 0, kn = Math.abs(m.k.n), kd = m.k.d;
  const upV = vs.filter(v => m.p[v] > 0).map(v => pw(v, m.p[v])), downV = vs.filter(v => m.p[v] < 0).map(v => pw(v, -m.p[v]));
  const top = (kn === 1 && upV.length ? '' : String(kn)) + upV.join('');
  const botParts = (kd === 1 ? 0 : 1) + downV.length, bot = (kd === 1 ? '' : String(kd)) + downV.join('');
  return (neg ? '−' : '') + (bot ? `${top}/${botParts > 1 ? '(' + bot + ')' : bot}` : top);
}
// What a typed expression still has left to simplify.
export function formOf(src) {
  const n = typeof src === 'string' ? parse(src) : src;
  const f = { vars: {}, numbers: { top: 0, bottom: 0 }, grouped: false, numberPower: false, zeroPower: false, power1: false, negative: false, sum: false };
  const walk = (n, den) => {
    if (n.t === 'num') { f.numbers[den ? 'bottom' : 'top']++; if (n.v.n < 0) f.negative = f.negative; return; }
    if (n.t === 'var') { f.vars[n.name] = (f.vars[n.name] || 0) + 1; return; }
    if (n.t === 'neg') return walk(n.a, den);
    if (n.t === 'group') { if (!den) f.grouped = true; return walk(n.a, den); }
    if (n.t !== 'bin') return;
    if (n.op === '+' || n.op === '-') { f.sum = true; walk(n.a, den); walk(n.b, den); return; }
    if (n.op === '*') { walk(n.a, den); walk(n.b, den); return; }
    if (n.op === '/') { walk(n.a, den); walk(n.b, !den); return; }
    if (n.op === '^') {
      const e = intOf(n.b);
      if (e === 0) f.zeroPower = true; else if (e === 1) f.power1 = true; else if (e < 0) f.negative = true;
      const base = n.a.t === 'group' ? n.a.a : n.a;
      if (base.t === 'var') f.vars[base.name] = (f.vars[base.name] || 0) + 1;
      else if (base.t === 'num') f.numberPower = true;
      else { f.grouped = true; walk(base, den); }
    }
  };
  walk(n, false);
  f.repeated = Object.values(f.vars).some(c => c > 1);
  return f;
}
const hasDen = src => { const n = typeof src === 'string' ? parse(src) : src; let d = false; const w = x => { if (!x || x.t === 'num' || x.t === 'var') return; if (x.t === 'bin' && x.op === '/') d = true; ['a', 'b'].forEach(k => x[k] && typeof x[k] === 'object' && w(x[k])); }; w(n); return d; };

export function checkMonomial(spec, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { correct: false, code: 'empty', message: 'Type an expression first.' };
  let tree; try { tree = parse(text); } catch (e) { return { correct: false, code: 'unreadable', message: e instanceof ExprError ? e.message : 'I couldn’t read that expression.' }; }
  const allowed = spec.vars || variables(parse(spec.answer)), extra = variables(tree).filter(v => !allowed.includes(v));
  if (extra.length) return { correct: false, code: 'unreadable', message: `This question uses ${allowed.length ? 'only ' + allowed.join(' and ') : 'no letters'}: ${extra.join(', ')} isn’t one of them.` };
  let mine; try { mine = mono(tree); } catch (e) { return { correct: false, code: e instanceof PowerError && /0⁰/.test(e.message) ? 'zero-zero' : 'unreadable', message: e.message }; }
  const target = mono(spec.answer);
  for (const t of spec.traps || []) { try { if (monoEq(mine, mono(t.expr))) return { correct: false, code: t.code || 'wrong', message: t.message || null }; } catch (e) { /* skip */ } }
  if (mine && monoEq(mine, target)) {
    const f = formOf(tree);
    if (f.sum) return { correct: false, code: 'unreadable', message: 'That’s equal, but write it as a single term.' };
    if (f.repeated) return { correct: false, code: 'unreadable', message: 'That’s equal, but combine each letter into one power.' };
    if (f.grouped) return { correct: false, code: 'unreadable', message: 'That’s equal, but finish simplifying: apply the exponent to every factor and remove the brackets.' };
    if (f.numberPower || f.numbers.top > 1 || f.numbers.bottom > 1) return { correct: false, code: 'unreadable', message: 'That’s equal, but work out the number part: one coefficient.' };
    if (f.zeroPower || f.power1) return { correct: false, code: 'unreadable', message: f.zeroPower ? 'That’s equal, but a nonzero base to the power 0 is 1: simplify it away.' : 'That’s equal, but x¹ is just x.' };
    if (spec.positive && f.negative) return { correct: false, code: 'unreadable', message: 'That’s equal, but write it with positive exponents: a⁻ⁿ = 1/aⁿ.' };
    if (spec.positive === false && hasDen(tree) && !hasDen(spec.answer)) return { correct: false, code: 'unreadable', message: 'That’s equal, but this question wants a single power (a negative exponent is fine).' };
    return { correct: true, code: 'correct', message: null };
  }
  if (!mine) return { correct: false, code: 'wrong', message: 'This simplifies to a single term: check whether something was added instead of multiplied.' };
  // Diagnose: the same coefficient but a different exponent, or the reverse.
  const same = Object.keys(target.p).length === Object.keys(mine.p).length && Object.keys(target.p).every(v => v in mine.p);
  if (same && mine.k.eq(target.k)) return { correct: false, code: 'exponent', message: 'The coefficient is right; check the exponent.' };
  if (same && Object.keys(target.p).every(v => mine.p[v] === target.p[v])) return { correct: false, code: 'coefficient', message: 'The exponent is right; check the number in front.' };
  return { correct: false, code: 'wrong', message: null };
}
export { frac as fracText };
