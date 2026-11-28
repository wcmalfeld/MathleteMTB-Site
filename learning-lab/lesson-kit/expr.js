// Lesson kit: a safe expression engine for Algebra 1 labs. Text is never run as code:
// it is tokenized and parsed into a small tree, and every number is an exact
// fraction (frac.js), so 0.1 + 0.2 is exactly 3/10 and (3/4)(2.4) is exactly
// 9/5. Pure; no DOM. First used by the Dream Line Project.
//
//   parse('3(18 + 2²) + 12')          -> tree (throws ExprError with a friendly message)
//   parse(text, { keepCase: true })    keep capital letters (formulas like G = 100R/L); by default letters are lower-cased
//   evaluate(tree, { t: 3, b: 2 })     -> Frac
//   value('4(3) + 3(2) + 5')           -> Frac (parse + evaluate)
//   toText(tree)                       -> '3(18 + 2²) + 12'  (× ÷ − and superscripts)
//   variables(tree)                    -> ['b', 't']
//   equivalent(a, b)                   -> same value for every input (polynomials compared exactly)
//   toPoly(tree)                       -> Map 'b:1,t:2' -> Frac, or null if it isn't a polynomial
//   isSimplified(tree)                 -> no grouping left and no like terms to combine
//   ready(tree) / next(tree) / reduce(tree, node)   the order of operations, one step at a time
//
// Input it reads: 4t + 3b + 5, 4*t, 4·t, 4×t, 48 ÷ 6 × 2, 2[7 + (3²)] ÷ 4,
// (3/4)(2.4), 2400 + (−125.5), x^2, x⁵, 10⁻³, {…}. Implicit multiplication (4t, 3(…),
// (…)(…)) has the same priority as × and ÷, worked left to right.
// Tree nodes:
//   { t: 'num', v: Frac, src }            a number as written (src keeps '2.50' or '3/4')
//   { t: 'var', name }
//   { t: 'neg', a }                       −a (a negative number literal is a num)
//   { t: 'bin', op: '+'|'-'|'*'|'/'|'^', a, b, implicit?, sym?, bar? }   sym: the symbol written (÷ or /); bar: show as a fraction bar
//   { t: 'group', open: '(' | '[' | '{', a }

import { Frac, show } from './frac.js';

export class ExprError extends Error {}
const SUPER = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };   // x⁵ → x^5, 10⁻³ → 10^-3 (2² → 2^2, exactly as before)
const OPEN = { '(': ')', '[': ']', '{': '}' }, CLOSE = { ')': '(', ']': '[', '}': '{' };

// ---------------------------------------------------------------- tokens
export function tokenize(raw, opts = {}) {
  const s = String(raw == null ? '' : raw)
    .replace(/[−–—]/g, '-').replace(/[×·∙✕]/g, '*').replace(/÷/g, '/')
    .replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '^' + [...m].map(c => SUPER[c]).join('')).replace(/\*\*/g, '^');
  const out = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
      if (!m || /^\.\d*\./.test(s.slice(i))) throw new ExprError('“' + s.slice(i, i + 4) + '” isn’t a number I can read.');
      if (/^\d*\.\d*\./.test(s.slice(i))) throw new ExprError('A number can only have one decimal point.');
      out.push({ k: 'num', s: m[1] }); i += m[1].length; continue;
    }
    if (/[a-zA-Z]/.test(c)) { out.push({ k: 'var', s: opts.keepCase ? c : c.toLowerCase() }); i++; continue; }
    if ('+-*/^'.includes(c)) { out.push({ k: 'op', s: c }); i++; continue; }
    if (OPEN[c]) { out.push({ k: 'open', s: c }); i++; continue; }
    if (CLOSE[c]) { out.push({ k: 'close', s: c }); i++; continue; }
    if (c === '=') throw new ExprError('Write just the expression, without an equals sign.');
    throw new ExprError('“' + c + '” isn’t something an expression here can use.');
  }
  return out;
}

// ---------------------------------------------------------------- parser
// expr := term (('+'|'-') term)*        term := unary (('*'|'/') unary | implicit unary)*
// unary := ('-'|'+') unary | power      power := primary ('^' unary)?
export function parse(raw, opts = {}) {
  // Keep which division symbol each '/' was written with, in order.
  const divSyms = [...String(raw == null ? '' : raw).replace(/[−–—]/g, '-')].filter(c => c === '/' || c === '÷');
  const toks = tokenize(raw, opts);
  if (!toks.length) throw new ExprError('Type an expression first.');
  let i = 0, d = 0;
  const peek = () => toks[i], eat = () => toks[i++];
  const isOp = (t, chars) => t && t.k === 'op' && chars.includes(t.s);
  function expr() {
    let a = term();
    while (isOp(peek(), '+-')) { const op = eat().s; if (!peek()) throw new ExprError('Something is missing after the last “' + (op === '-' ? '−' : op) + '”.'); a = { t: 'bin', op, a, b: term() }; }
    return a;
  }
  function term() {
    let a = unary();
    for (;;) {
      const t = peek();
      if (isOp(t, '*/')) {
        eat(); if (!peek()) throw new ExprError('Something is missing after the last “' + (t.s === '*' ? '×' : '÷') + '”.');
        a = t.s === '/' ? { t: 'bin', op: '/', a, b: unary(), sym: divSyms[d++] === '÷' ? '÷' : '/' } : { t: 'bin', op: '*', a, b: unary() };
      } else if (t && (t.k === 'num' || t.k === 'var' || t.k === 'open')) {
        if (t.k === 'num' && a.t === 'num') throw new ExprError('Two numbers are side by side. Put an operation between them.');
        a = { t: 'bin', op: '*', a, b: unary(true), implicit: true };
      } else return a;
    }
  }
  function unary(noSign) {
    const t = peek();
    if (!noSign && isOp(t, '-+')) {
      eat();
      if (!peek()) throw new ExprError('Something is missing after the last sign.');
      const a = unary();
      if (t.s === '+') return a;
      if (a.t === 'num' && !a.src.startsWith('-')) return { t: 'num', v: a.v.neg(), src: '-' + a.src };
      return { t: 'neg', a };
    }
    return power();
  }
  function power() {
    const a = primary();
    if (isOp(peek(), '^')) { eat(); if (!peek()) throw new ExprError('An exponent is missing after “^”.'); return { t: 'bin', op: '^', a, b: unary() }; }
    return a;
  }
  function primary() {
    const t = eat();
    if (!t) throw new ExprError('The expression ends too soon.');
    if (t.k === 'num') return { t: 'num', v: Frac.of(Number(t.s.startsWith('.') ? '0' + t.s : t.s)), src: t.s.startsWith('.') ? '0' + t.s : t.s };
    if (t.k === 'var') return { t: 'var', name: t.s };
    if (t.k === 'open') {
      if (peek() && peek().k === 'close') throw new ExprError('There’s an empty pair of brackets.');
      const a = expr(), c = eat();
      if (!c || c.k !== 'close') throw new ExprError('A bracket is opened but never closed.');
      if (CLOSE[c.s] !== t.s) throw new ExprError('A “' + t.s + '” is closed with “' + c.s + '”. Match each bracket with its own kind.');
      return { t: 'group', open: t.s, a };
    }
    if (t.k === 'close') throw new ExprError('There’s a closing bracket with no opening one.');
    throw new ExprError('“' + (t.s === '*' ? '×' : t.s === '/' ? '÷' : t.s) + '” needs a number or letter before it.');
  }
  const tree = expr();
  if (i < toks.length) throw new ExprError(toks[i].k === 'close' ? 'There’s a closing bracket with no opening one.' : 'I couldn’t read the end of that expression.');
  return tree;
}

// ---------------------------------------------------------------- evaluate
function powFrac(base, e) {
  if (!e.int) throw new ExprError('This lab only uses whole-number exponents.');
  let n = Math.abs(e.n), r = new Frac(1);
  if (n > 64) throw new ExprError('That exponent is too large.');
  while (n--) r = r.mul(base);
  return e.n < 0 ? new Frac(1).div(r) : r;
}
export function evaluate(n, vars = {}) {
  switch (n.t) {
    case 'num': return n.v;
    case 'var': {
      if (!(n.name in vars)) throw new ExprError('There’s no value for ' + n.name + '.');
      return Frac.of(vars[n.name]);
    }
    case 'neg': return evaluate(n.a, vars).neg();
    case 'group': return evaluate(n.a, vars);
    case 'bin': {
      const a = evaluate(n.a, vars), b = evaluate(n.b, vars);
      if (n.op === '+') return a.add(b);
      if (n.op === '-') return a.sub(b);
      if (n.op === '*') return a.mul(b);
      if (n.op === '/') { if (b.zero) throw new ExprError('Division by zero isn’t defined.'); return a.div(b); }
      return powFrac(a, b);
    }
  }
  throw new ExprError('unknown node');
}
export const value = (raw, vars) => evaluate(typeof raw === 'string' ? parse(raw) : raw, vars);

export function variables(n, acc = new Set()) {
  if (n.t === 'var') acc.add(n.name);
  for (const k of ['a', 'b']) if (n[k]) variables(n[k], acc);
  return [...acc].sort();
}

// ---------------------------------------------------------------- text
const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 };
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const numText = n => (n.src || show(n.v)).replace(/^-/, '−');
// Pretty text: '3(18 + 2²) + 12', '48 ÷ 6 × 2', '2400 + (−125.5)'. Brackets the
// writer used are kept; brackets the structure needs are added.
export function toText(n, parentPrec = 0, right = false) {
  const wrap = (s, p) => (p < parentPrec || (right && p === parentPrec && p < 4) ? '(' + s + ')' : s);
  switch (n.t) {
    case 'num': { const s = numText(n); return s.startsWith('−') && (parentPrec > 0) ? '(' + s + ')' : s; }
    case 'var': return n.name;
    case 'group': return n.open + toText(n.a) + OPEN[n.open];
    case 'neg': return wrap('−' + toText(n.a, 3), 3);
    case 'bin': {
      const p = PREC[n.op];
      if (n.op === '^') {
        const e = n.b.t === 'num' && /^\d$/.test(n.b.src || '') ? SUP[n.b.src] : '^' + toText(n.b, 5);
        return wrap(toText(n.a, 5) + e, 4);
      }
      if (n.implicit) return wrap((n.a.t === 'num' ? numText(n.a) : toText(n.a, 2)) + toText(n.b, 3, true), 2);
      const sym = n.op === '*' ? ' × ' : n.op === '/' ? (n.sym === '/' ? '/' : ' ÷ ') : n.op === '-' ? ' − ' : ' + ';
      return wrap(toText(n.a, p) + sym + toText(n.b, p, true), p);
    }
  }
  return '';
}

// ---------------------------------------------------------------- polynomials
// A polynomial as Map monomial -> coefficient, monomial key 'b:1,t:2' (sorted; '' is the constant).
const mkey = m => Object.keys(m).sort().filter(k => m[k]).map(k => k + ':' + m[k]).join(',');
const unkey = k => (k ? Object.fromEntries(k.split(',').map(p => { const [v, e] = p.split(':'); return [v, Number(e)]; })) : {});
function padd(A, B, sign = 1) { const R = new Map(A); for (const [k, c] of B) { const v = (R.get(k) || new Frac(0)).add(sign < 0 ? c.neg() : c); if (v.zero) R.delete(k); else R.set(k, v); } return R; }
function pmul(A, B) {
  let R = new Map();
  for (const [ka, ca] of A) for (const [kb, cb] of B) {
    const m = unkey(ka); for (const [v, e] of Object.entries(unkey(kb))) m[v] = (m[v] || 0) + e;
    R = padd(R, new Map([[mkey(m), ca.mul(cb)]]));
  }
  return R;
}
export function toPoly(n) {
  switch (n.t) {
    case 'num': return n.v.zero ? new Map() : new Map([['', n.v]]);
    case 'var': return new Map([[n.name + ':1', new Frac(1)]]);
    case 'neg': { const a = toPoly(n.a); return a && padd(new Map(), a, -1); }
    case 'group': return toPoly(n.a);
    case 'bin': {
      const a = toPoly(n.a), b = toPoly(n.b);
      if (!a || !b) return null;
      if (n.op === '+') return padd(a, b);
      if (n.op === '-') return padd(a, b, -1);
      if (n.op === '*') return pmul(a, b);
      if (n.op === '/') { if (b.size !== 1 || !b.has('')) return null; const inv = new Frac(1).div(b.get('')); return pmul(a, new Map([['', inv]])); }
      if (b.size > 1 || (b.size === 1 && !b.has(''))) return null;
      const e = b.size ? b.get('') : new Frac(0);
      if (!e.int || e.n < 0 || e.n > 12) return null;
      let r = new Map([['', new Frac(1)]]); for (let k = 0; k < e.n; k++) r = pmul(r, a); return r;
    }
  }
  return null;
}
const polyEq = (A, B) => A.size === B.size && [...A].every(([k, c]) => B.has(k) && B.get(k).eq(c));
const SAMPLES = [new Frac(2), new Frac(3, 7), new Frac(-5), new Frac(11), new Frac(13, 3), new Frac(-2, 9)];
// Same value for every input. Polynomials are compared exactly; anything else
// (a variable in a denominator) is compared at several exact sample points.
export function equivalent(a, b) {
  const A = typeof a === 'string' ? parse(a) : a, B = typeof b === 'string' ? parse(b) : b;
  const pa = toPoly(A), pb = toPoly(B);
  if (pa && pb) return polyEq(pa, pb);
  const vs = [...new Set([...variables(A), ...variables(B)])];
  let compared = 0;
  for (let s = 0; s < SAMPLES.length; s++) {
    const vars = Object.fromEntries(vs.map((v, j) => [v, SAMPLES[(s + j) % SAMPLES.length].add(j)]));
    let x, y; try { x = evaluate(A, vars); y = evaluate(B, vars); } catch (e) { continue; }
    if (!x.eq(y)) return false; compared++;
  }
  return compared >= 3;
}

// The terms joined by + and − at the top level: '4t + 3b − 5' -> [4t, 3b, −5].
export function terms(n, sign = 1, out = []) {
  if (n.t === 'bin' && (n.op === '+' || n.op === '-')) { terms(n.a, sign, out); terms(n.b, n.op === '-' ? -sign : sign, out); return out; }
  out.push({ node: n, sign });
  return out;
}
const hasGroup = n => n.t === 'group' || (['a', 'b'].some(k => n[k] && hasGroup(n[k])));
// Simplified: no grouping symbols left, every term a single monomial, and no
// two terms alike (so 3t + 2t and 4(x + 2) are not simplified; 5t and 4x + 8 are).
export function isSimplified(n) {
  if (hasGroup(n)) return false;
  const P = toPoly(n); if (!P) return false;
  const ts = terms(n), keys = new Set();
  for (const { node } of ts) {
    const p = toPoly(node); if (!p || p.size !== 1) return false;
    const k = [...p.keys()][0]; if (keys.has(k)) return false; keys.add(k);
  }
  return ts.length === P.size || (P.size === 0 && ts.length === 1);
}

// ---------------------------------------------------------------- order of operations
// A step is one operation whose operands are already numbers. Grouping
// symbols around a single number disappear (3(22) becomes 3 × 22). Which
// ready steps are allowed next: inside the same grouping (a bracket, or a
// fraction bar's top or bottom), a step may not jump ahead of a ready step
// with higher priority. Left to right among equal priorities comes from the
// tree itself (18 − 4 + 3 is (18 − 4) + 3).
const isNum = n => n.t === 'num' || (n.t === 'group' && isNum(n.a));
const numOf = n => (n.t === 'group' ? numOf(n.a) : n);
const rank = n => (n.t === 'neg' ? 3 : PREC[n.op]);
export const kindOf = n => (n.t === 'neg' ? 'negate' : { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide', '^': 'exponent' }[n.op]);

// Every operation node, with the grouping scope it sits in.
function ops(n, scope = 'root', out = [], path = 'r') {
  if (n.t === 'group') { ops(n.a, path, out, path + 'g'); return out; }
  if (n.t === 'bin' || n.t === 'neg') {
    out.push({ node: n, scope, path });
    const inScope = (k) => (n.bar ? path + k : scope);
    if (n.a) ops(n.a, inScope('a'), out, path + 'a');
    if (n.b) ops(n.b, inScope('b'), out, path + 'b');
  }
  return out;
}
export function operations(tree) { return ops(tree).map(x => ({ ...x, ready: isReady(x.node) })); }
export const isReady = n => (n.t === 'neg' ? isNum(n.a) : n.t === 'bin' && isNum(n.a) && isNum(n.b));
export function ready(tree) {
  const all = ops(tree), R = all.filter(x => isReady(x.node));
  return R.filter(x => !R.some(y => y !== x && y.scope === x.scope && rank(y.node) > rank(x.node))).map(x => x.node);
}
export const next = tree => ready(tree)[0] || null;
// The value of a ready step, and its words: '2² = 4'.
export function stepOf(node) {
  const v = evaluate(node);
  const text = node.t === 'neg' ? '−(' + toText(numOf(node.a)) + ')' : toText({ ...node, a: numOf(node.a), b: numOf(node.b), implicit: false });
  return { value: v, text: text + ' = ' + show(v).replace(/^-/, '−'), kind: kindOf(node) };
}
// Replace one ready node with its value and tidy brackets around single numbers.
export function reduce(tree, target) {
  const v = evaluate(target);
  const rep = { t: 'num', v, src: show(v).replace('−', '-'), fresh: true };   // fresh: the value just produced (for highlighting)
  function go(n) {
    if (n === target) return rep;
    if (n.t === 'group') { const a = go(n.a); return a === n.a ? n : a.t === 'num' ? a : { ...n, a }; }
    if (n.t === 'neg') { const a = go(n.a); return a === n.a ? n : { ...n, a }; }
    if (n.t === 'bin') {
      const a = go(n.a), b = go(n.b);
      if (a === n.a && b === n.b) return n;
      const out = { ...n, a, b };
      // 3(22): once the bracket is gone, the multiplication is written ×.
      if (n.implicit && (a.t === 'num' && b.t === 'num')) out.implicit = false;
      return out;
    }
    return n;
  }
  return go(tree);
}
// The full sequence of steps (always taking the first allowed one).
export function solveSteps(tree) {
  const steps = []; let t = typeof tree === 'string' ? parse(tree) : tree, guard = 0;
  while (t.t !== 'num' && guard++ < 100) {
    const n = next(t); if (!n) break;
    steps.push(stepOf(n)); t = reduce(t, n);
    steps[steps.length - 1].after = toText(t);
  }
  return steps;
}
// Why a chosen step isn't allowed yet (for feedback), in words.
export function whyNot(tree, chosen) {
  const R = ready(tree);
  if (R.includes(chosen)) return null;
  const all = ops(tree), me = all.find(x => x.node === chosen);
  const inside = n => n.t === 'group' || (n.t === 'bin' && !isNum(n));
  const operandGroup = [chosen.a, chosen.b].filter(Boolean).find(x => x.t === 'group' && !isNum(x));
  if (operandGroup) return { code: 'ignore-grouping', text: 'Part of this step is still inside grouping symbols. Simplify inside the ' + (operandGroup.open === '[' ? 'brackets' : 'parentheses') + ' first.' };
  if (chosen.bar) return { code: 'fraction-bar', text: 'The fraction bar groups its top and its bottom. Finish the numerator (and denominator) before dividing.' };
  const rk = rank(chosen);
  const sameScopeReady = all.filter(x => R.includes(x.node) && me && x.scope === me.scope);
  const higher = sameScopeReady.find(x => rank(x.node) > rk);
  if (higher) {
    const k = kindOf(higher.node);
    if (k === 'exponent') return { code: 'exponent-order', text: 'There’s an exponent to work out first: exponents come before multiplication, division, addition and subtraction.' };
    return { code: 'add-before-multiply', text: 'Multiplication and division come before addition and subtraction.' };
  }
  const operand = [chosen.a, chosen.b].filter(Boolean).find(inside);
  if (operand && operand.t === 'bin' && rank(operand) === rk && rk < 4) return { code: 'left-to-right', text: (rk === 2 ? 'Multiplication and division' : 'Addition and subtraction') + ' share the same priority, so work from left to right.' };
  if (operand && operand.t === 'bin' && operand.bar) return { code: 'fraction-bar', text: 'The fraction bar is a grouping symbol: work out the division first.' };
  if (operand && operand.t === 'bin' && rank(operand) > rk) return { code: rank(operand) === 4 ? 'exponent-order' : 'add-before-multiply', text: (rank(operand) === 4 ? 'Exponents come' : 'Multiplication and division come') + ' before ' + (rk === 1 ? 'addition and subtraction' : 'this step') + ', and anything in grouping symbols comes first of all.' };
  const first = all.find(x => x.node === R[0]);
  if (first && first.scope !== 'root') return { code: 'ignore-grouping', text: 'Not yet. Start inside the grouping symbols.' };
  return { code: 'order', text: 'Not yet: part of this step hasn’t been worked out.' };
}

// ---------------------------------------------------------------- shape
// A structural fingerprint for "did they write the substitution?": brackets
// around a single number, implicit vs written ×, and the order of added terms
// and multiplied factors don't matter; anything else (working it out, or a
// different structure) does. 4(3) + 3(2) + 5 and 3 × 2 + 4 × 3 + 5 match; 12 + 6 + 5 doesn't.
export function shape(n) {
  const strip = x => (x.t === 'group' ? strip(x.a) : x);
  n = strip(n);
  if (n.t === 'num') return 'n' + n.v.n + '/' + n.v.d;
  if (n.t === 'var') return 'v' + n.name;
  if (n.t === 'neg') return 'neg(' + shape(n.a) + ')';
  if (n.op === '+' || n.op === '-') return 'S[' + terms(n).map(({ node, sign }) => (sign < 0 ? '-' : '+') + shape(node)).sort().join(',') + ']';
  if (n.op === '*') { const fs = []; const f = x => { x = strip(x); if (x.t === 'bin' && x.op === '*') { f(x.a); f(x.b); } else fs.push(shape(x)); }; f(n); return 'P[' + fs.sort().join(',') + ']'; }
  return n.op + '(' + shape(n.a) + ',' + shape(n.b) + ')';
}
export const sameShape = (a, b) => shape(typeof a === 'string' ? parse(a) : a) === shape(typeof b === 'string' ? parse(b) : b);

// ---------------------------------------------------------------- checking a typed expression
// spec = { answer: '4t + 3b + 5', vars?: ['t', 'b'], form?: 'simplified' | 'shape', also?: [other accepted shapes],
//          shapeMessage?, traps?: [{ expr, code, message }] }
// form 'shape': the answer must be written in the same structure (a substitution, not its value).
// Returns { correct, code, message }. code 'empty' / 'unreadable' means
// "not an attempt yet" (a typo, a letter the question doesn't use, or a
// right answer that still needs simplifying).
export function checkExpression(spec, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { correct: false, code: 'empty', message: 'Type an expression first.' };
  let tree;
  try { tree = parse(text); } catch (e) { return { correct: false, code: 'unreadable', message: e instanceof ExprError ? e.message : 'I couldn’t read that expression.' }; }
  const allowed = spec.vars || variables(parse(spec.answer));
  const extra = variables(tree).filter(v => !allowed.includes(v));
  if (extra.length) return { correct: false, code: 'unreadable', message: `This question uses ${allowed.length ? 'only the letter' + (allowed.length > 1 ? 's ' : ' ') + allowed.join(' and ') : 'no letters'}: ${extra.join(', ')} isn’t one of them.` };
  if (equivalent(tree, spec.answer)) {
    if (spec.form === 'simplified' && !isSimplified(tree)) return { correct: false, code: 'unreadable', message: 'That’s equal to the answer, but it isn’t simplified yet: remove any grouping and combine like terms.' };
    if (spec.form === 'shape' && ![spec.answer, ...(spec.also || [])].some(a => sameShape(tree, a))) return { correct: false, code: 'unreadable', message: spec.shapeMessage || 'That has the right value, but show the substitution first: write each value in place of its letter, like 4(3).' };
    return { correct: true, code: 'correct', message: null };
  }
  for (const t of spec.traps || []) { try { if (equivalent(tree, t.expr)) return { correct: false, code: t.code || 'wrong', message: t.message || null }; } catch (e) { /* skip a bad trap */ } }
  return { correct: false, code: 'wrong', message: null };
}
