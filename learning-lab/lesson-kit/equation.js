// Lesson kit: linear equations and inequalities in one variable, built on
// expr.js (exact fractions; text is never run as code). Pure; no DOM. First
// used by The Dream Line Goes Pro (Algebra 1, Unit 2).
//
//   parseRelation('3(x + 4) + 2(x + 1) = 29')   -> { parts: [tree, tree], rels: ['='] }
//   parseRelation('36 ≤ 8x + 4 ≤ 84')            -> three parts, two signs
//   solve(rel)       -> { kind: 'one', value } | { kind: 'none' } | { kind: 'all' }
//                       | { kind: 'ray', at, dir: 'left'|'right', closed } | { kind: 'interval', lo, hi, loIn, hiIn }
//   sameSet(a, b)    two solution sets are the same
//   start(text) / moves(state) / apply(state, move)   the solver, one move at a time:
//     distribute → combine like terms → collect the variable → undo the constant → undo the coefficient
//     (dividing an inequality by a negative reverses its sign). moves() also returns
//     the tempting wrong moves (one side only, the wrong inverse, dividing first,
//     forgetting to flip, multiplying only the first term) with misconception codes.
//   checkEquation(spec, raw) / checkInequality(spec, raw)   marking typed answers
//   relationAt(text, values)   lhs − rhs at the given values (for testing rearranged formulas)

import { parse, toText, toPoly, terms, variables, sameShape, evaluate, ExprError } from './expr.js';
import { Frac, show } from './frac.js';

export const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤', '=': '=' };
const up = r => r === '<' || r === '≤';
const S = x => show(Frac.of(x)).replace(/^-/, '−');

// ---------------------------------------------------------------- reading
export function parseRelation(raw, opts = {}) {
  const s = String(raw == null ? '' : raw).replace(/<=|=</g, '≤').replace(/>=|=>/g, '≥').replace(/≦/g, '≤').replace(/≧/g, '≥');
  if (/\bor\b|\band\b/i.test(s)) throw new ExprError('Write one inequality here (an “or” answer is graphed on the number line instead).');
  const bits = s.split(/(≤|≥|<|>|=)/);
  if (bits.length < 3) throw new ExprError('Write a full equation or inequality: it needs =, <, >, ≤ or ≥.');
  if (bits.length > 5) throw new ExprError('That has too many signs. Use one, or two for a compound inequality.');
  const parts = [], rels = [];
  bits.forEach((b, i) => { if (i % 2) rels.push(b); else { if (!b.trim()) throw new ExprError('Something is missing on one side of the ' + (rels[rels.length - 1] || bits[1]) + ' sign.'); parts.push(parse(b, opts)); } });
  if (rels.length === 2 && (rels.includes('=') || up(rels[0]) !== up(rels[1]))) throw new ExprError('In a compound inequality both signs point the same way, like 36 ≤ 8x + 4 ≤ 84.');
  return { parts, rels };
}
const varsOf = R => [...new Set(R.parts.flatMap(p => variables(p)))];

// a·v + b, or null if the part isn't linear in v (and nothing else)
export function linear(tree, v) {
  const P = toPoly(tree); if (!P) return null;
  let a = new Frac(0), b = new Frac(0);
  for (const [k, c] of P) { if (k === '') b = c; else if (k === v + ':1') a = c; else return null; }
  return { a, b };
}
const cmp = (x, rel, y) => { const d = Number(Frac.of(x).sub(y)); return rel === '=' ? d === 0 : rel === '<' ? d < 0 : rel === '>' ? d > 0 : rel === '≤' ? d <= 0 : d >= 0; };

// ---------------------------------------------------------------- solving
export function solve(R, v) {
  R = typeof R === 'string' ? parseRelation(R) : R;
  v = v || varsOf(R)[0];
  if (varsOf(R).length > 1) throw new ExprError('This solver works with one variable.');
  const L = R.parts.map(p => linear(p, v));
  if (L.some(x => !x)) throw new ExprError('That isn’t a linear equation or inequality.');
  if (R.parts.length === 3) {
    let [lo, mid, hi] = L, [r0, r1] = R.rels;
    if (!up(r0)) { [lo, hi] = [hi, lo]; [r0, r1] = [FLIP[r1], FLIP[r0]]; }
    if (!lo.a.zero || !hi.a.zero || mid.a.zero) throw new ExprError('Put the variable in the middle part only.');
    let A = lo.b.sub(mid.b).div(mid.a), B = hi.b.sub(mid.b).div(mid.a), aIn = r0 === '≤', bIn = r1 === '≤';
    if (mid.a.n < 0) { [A, B] = [B, A]; [aIn, bIn] = [bIn, aIn]; }
    return { kind: 'interval', v, lo: A, hi: B, loIn: aIn, hiIn: bIn };
  }
  const rel = R.rels[0], a = L[0].a.sub(L[1].a), c = L[1].b.sub(L[0].b);
  if (a.zero) return { kind: cmp(0, rel, c) ? 'all' : 'none', v };
  const value = c.div(a), r = a.n < 0 ? FLIP[rel] : rel;
  if (r === '=') return { kind: 'one', v, value };
  return { kind: 'ray', v, at: value, dir: up(r) ? 'left' : 'right', closed: r === '≤' || r === '≥', rel: r };
}
export function sameSet(a, b) {
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === 'one') return a.value.eq(b.value);
  if (a.kind === 'ray') return a.at.eq(b.at) && a.dir === b.dir && a.closed === b.closed;
  if (a.kind === 'interval') return a.lo.eq(b.lo) && a.hi.eq(b.hi) && a.loIn === b.loIn && a.hiIn === b.hiIn;
  if (a.kind === 'or') return sameSet(a.left, b.left) && sameSet(a.right, b.right);
  return true;   // 'none' / 'all'
}
// Words for a solution set: 'x ≤ 8', '4 ≤ x ≤ 10', 'no solution', 'every value of x'.
export function setText(s) {
  const v = s.v || 'x';
  if (s.kind === 'one') return `${v} = ${S(s.value)}`;
  if (s.kind === 'ray') return `${v} ${s.dir === 'left' ? (s.closed ? '≤' : '<') : (s.closed ? '≥' : '>')} ${S(s.at)}`;
  if (s.kind === 'interval') return `${S(s.lo)} ${s.loIn ? '≤' : '<'} ${v} ${s.hiIn ? '≤' : '<'} ${S(s.hi)}`;
  if (s.kind === 'or') return `${setText({ ...s.left, v })} or ${setText({ ...s.right, v })}`;
  return s.kind === 'none' ? 'no solution' : `every value of ${v}`;
}
// Does a number belong to a solution set?
export function contains(s, x) {
  x = Frac.of(x);
  if (s.kind === 'one') return s.value.eq(x);
  if (s.kind === 'ray') return s.dir === 'left' ? (s.closed ? Number(x.sub(s.at)) <= 0 : Number(x.sub(s.at)) < 0) : (s.closed ? Number(x.sub(s.at)) >= 0 : Number(x.sub(s.at)) > 0);
  if (s.kind === 'interval') return (s.loIn ? Number(x.sub(s.lo)) >= 0 : Number(x.sub(s.lo)) > 0) && (s.hiIn ? Number(x.sub(s.hi)) <= 0 : Number(x.sub(s.hi)) < 0);
  if (s.kind === 'or') return contains(s.left, x) || contains(s.right, x);
  return s.kind === 'all';
}

// ---------------------------------------------------------------- the solver
// Linear text in a fixed style: 5x + 14, −12x, x, (1/3)x − 2, 7
export function linText(a, b, v) {
  a = Frac.of(a); b = Frac.of(b);
  let s = '';
  if (!a.zero) s = a.eq(1) ? v : a.eq(-1) ? '−' + v : (a.int ? S(a) : (a.n < 0 ? '−' : '') + '(' + S(a.n < 0 ? a.neg() : a) + ')') + v;
  if (b.zero) return s || '0';
  if (!s) return S(b);
  return s + (b.n < 0 ? ' − ' + S(b.neg()) : ' + ' + S(b));
}
const termCount = p => terms(p).length;
const needsDistribute = p => terms(p).some(({ node }) => { const q = toPoly(node); return q && q.size > 1; });
const needsCombine = p => { const q = toPoly(p); return q && termCount(p) > Math.max(1, q.size); };
// Expand each term on its own, keeping like terms apart: 3(x + 4) + 2(x + 1) -> 3x + 12 + 2x + 2
function expandText(p, v) {
  const out = [];
  for (const { node, sign } of terms(p)) {
    const q = toPoly(node) || new Map();
    const a = (q.get(v + ':1') || new Frac(0)).mul(sign), b = (q.get('') || new Frac(0)).mul(sign);
    if (!a.zero) out.push(linText(a, 0, v)); if (!b.zero) out.push(S(b));
  }
  return (out.join(' + ') || '0').replace(/\+ −/g, '− ');
}
const partialText = (p, v) => {   // the classic mistake: multiply only the first term in each bracket
  const out = [];
  for (const { node, sign } of terms(p)) {
    if (node.t === 'bin' && node.op === '*' && (node.b.t === 'group' || node.a.t === 'group')) {
      const [k, g] = node.b.t === 'group' ? [node.a, node.b.a] : [node.b, node.a.a];
      const ts = terms(g); const kv = evaluate(k);
      out.push(...ts.map(({ node: n, sign: s2 }, i) => { const q = toPoly(n), a = (q.get(v + ':1') || new Frac(0)).mul(s2 * sign), b = (q.get('') || new Frac(0)).mul(s2 * sign); return linText(i === 0 ? a.mul(kv) : a, i === 0 ? b.mul(kv) : b, v); }));
    } else out.push((sign < 0 ? '−' : '') + toText(node, 1));
  }
  return out.join(' + ').replace(/\+ −/g, '− ');
};

export function start(text, v, opts = {}) {
  const R = typeof text === 'string' ? parseRelation(text, opts) : text;
  v = v || varsOf(R)[0] || 'x';
  return { parts: R.parts, texts: R.parts.map(p => toText(p)), rels: R.rels, v, applied: null, opts };
}
export const joinParts = (texts, rels) => texts.map((t, i) => (i ? ' ' + rels[i - 1] + ' ' : '') + t).join('');
export const stateText = st => joinParts(st.texts, st.rels);
const lins = st => st.parts.map(p => linear(p, st.v));
const make = (st, texts, rels, applied) => ({ parts: texts.map(t => parse(t, st.opts)), texts, rels: rels || st.rels, v: st.v, applied: applied || null, opts: st.opts });
const ineq = st => st.rels.some(r => r !== '=');
const sides = st => (st.parts.length === 3 ? 'all three parts' : 'both sides');

// Is the state finished? -> { done, set } (set: the solution, or 'none'/'all' when the variable has gone)
export function finished(st) {
  const L = lins(st), v = st.v;
  if (L.some(x => !x)) return { done: false };
  const has = L.map(x => !x.a.zero);
  if (!has.some(Boolean)) return { done: true, set: solve({ parts: st.parts, rels: st.rels }, v), vanished: true };
  if (st.parts.length === 3) return { done: L[1].a.eq(1) && L[1].b.zero && !has[0] && !has[2] && !needsCombine(st.parts[1]), set: null };
  const k = has[0] ? 0 : 1;
  return { done: !has[1 - k] && L[k].a.eq(1) && L[k].b.zero && k === 0 && termCount(st.parts[0]) === 1 && termCount(st.parts[1]) === 1, set: null };
}

// The correct next move and the tempting wrong ones.
export function moves(st) {
  const v = st.v, n = st.parts.length;
  if (finished(st).done) return { next: null, wrong: [] };
  const opText = (op, x) => (op === '+' ? 'Add ' + S(x) + ' to' : op === '-' ? 'Subtract ' + S(x) + ' from' : op === '*' ? 'Multiply' : 'Divide');
  // 1. distribute
  if (st.parts.some(needsDistribute)) {
    return { next: { kind: 'distribute', label: 'Distribute: multiply into every term in each bracket', result: st.parts.map(p => expandText(p, v)) },
      wrong: [{ kind: 'distribute-partial', code: 'distribute-partial', label: 'Multiply only the first term in each bracket', why: 'The number outside multiplies every term inside the brackets, not just the first one.', result: st.parts.map(p => (needsDistribute(p) ? partialText(p, v) : toText(p))) },
        { kind: 'early', code: 'skip-distribute', label: 'Divide ' + sides(st) + ' first', why: 'Clear the brackets first: distribute, then combine like terms.' }] };
  }
  // 2. combine like terms
  const L = lins(st);
  if (st.parts.some(needsCombine)) {
    return { next: { kind: 'combine', label: 'Combine like terms on each side', result: L.map(x => linText(x.a, x.b, v)) },
      wrong: [{ kind: 'combine-unlike', code: 'combine-unlike', label: 'Combine every term into one ' + v + ' term', why: 'Only like terms combine: the ' + v + ' terms with each other, and the numbers with each other.' },
        { kind: 'early', code: 'dividing-early', label: 'Undo the constant before tidying up', why: 'Tidy each side first: combine like terms so you can see what to undo.' }] };
  }
  // 3. collect the variable on one side
  if (n === 2 && !L[0].a.zero && !L[1].a.zero) {
    const [a0, a1] = [L[0].a, L[1].a], take = Number(a0) >= Number(a1) ? a1 : a0, t = linText(take, 0, v);
    const res = L.map(x => linText(x.a.sub(take), x.b, v));
    const op = take.n < 0 ? 'Add ' + linText(take.neg(), 0, v) + ' to' : 'Subtract ' + t + ' from';
    return { next: { kind: 'collect', label: `${op} both sides`, result: res, applied: L.map(x => linText(x.a, x.b, v) + (take.n < 0 ? ' + ' + linText(take.neg(), 0, v) : ' − ' + t)) },
      wrong: [{ kind: 'one-side', code: 'one-side', label: `${op} the right side only`, why: 'Not quite. Remember that you need to perform the same operation on both sides.', tilt: true },
        { kind: 'wrong-inverse', code: 'wrong-inverse', label: (take.n < 0 ? 'Subtract ' + linText(take.neg(), 0, v) + ' from' : 'Add ' + t + ' to') + ' both sides', why: 'That adds more ' + v + ' terms instead of removing them: use the inverse operation.' }] };
  }
  // 4. undo the constant on the variable's side
  const k = n === 3 ? 1 : (!L[0].a.zero ? 0 : 1), X = L[k];
  if (!X.b.zero) {
    const minus = X.b.n > 0, amt = minus ? X.b : X.b.neg();
    const res = L.map(x => linText(x.a, minus ? x.b.sub(amt) : x.b.add(amt), v));
    const op = minus ? `Subtract ${S(amt)} from` : `Add ${S(amt)} to`;
    const wrong = [{ kind: 'one-side', code: 'one-side', label: `${op} the ${n === 3 ? 'middle part' : k === 0 ? 'left side' : 'right side'} only`, why: 'Not quite. Remember that you need to perform the same operation on ' + sides(st) + '.', tilt: true },
      { kind: 'wrong-inverse', code: 'wrong-inverse', label: `${minus ? `Add ${S(amt)} to` : `Subtract ${S(amt)} from`} ${sides(st)}`, why: `The ${S(X.b)} is ${minus ? 'added' : 'subtracted'}, so undo it with the inverse: ${minus ? 'subtract' : 'add'} ${S(amt)}.` }];
    if (!X.a.eq(1)) wrong.push({ kind: 'divide-first', code: 'divide-before-constant', label: `Divide ${sides(st)} by ${S(X.a)} first`, why: 'Undo the addition or subtraction first, then the multiplication: work backwards through the order of operations.' });
    return { next: { kind: 'constant', label: `${op} ${sides(st)}`, result: res, applied: L.map(x => linText(x.a, x.b, v) + (minus ? ' − ' : ' + ') + S(amt)) }, wrong: wrong.slice(0, 3) };
  }
  // 5. undo the coefficient (reverse an inequality for a negative)
  const a = X.a;
  if (!a.eq(1)) {
    const neg = a.n < 0, frac = !a.int && a.n === 1;
    const by = frac ? new Frac(a.d) : a, verb = frac ? 'Multiply' : 'Divide';
    const flipNow = neg && ineq(st), rels = flipNow ? st.rels.map(r => FLIP[r]) : st.rels;
    let res = L.map(x => linText(x.a.div(a), x.b.div(a), v));
    let rels2 = rels;
    if (n === 3 && flipNow) { res = res.slice().reverse(); rels2 = rels.slice().reverse().map(r => FLIP[r]); }
    const wrapT = t => (/ /.test(t) ? '(' + t + ')' : t);
    const applied = L.map(x => wrapT(linText(x.a, x.b, v)) + (frac ? ' × ' + S(by) : ' ÷ ' + (neg ? '(' + S(a) + ')' : S(a))));
    const wrong = [{ kind: 'wrong-inverse', code: 'wrong-inverse', label: `${frac ? 'Divide' : 'Multiply'} ${sides(st)} by ${S(by)}`, why: frac ? `${v} is divided by ${S(a.d)}, so multiply to undo it.` : `${v} is multiplied by ${S(a)}, so divide to undo it.` },
      { kind: 'subtract-coef', code: 'wrong-inverse', label: neg ? `Add ${S(a.neg())} to ${sides(st)}` : `Subtract ${S(a)} from ${sides(st)}`, why: `${linText(a, 0, v)} means ${S(a)} × ${v}: undo multiplication with division, not subtraction.` }];
    if (flipNow) wrong.unshift({ kind: 'no-flip', code: 'no-flip', label: `Divide ${sides(st)} by ${S(a)} and keep the sign`, why: 'Careful! When you divide an inequality by a negative number, the direction of the inequality must reverse.' });
    return { next: { kind: 'scale', label: `${verb} ${sides(st)} by ${S(by)}${flipNow ? ' and reverse the sign' : ''}`, result: res, rels: rels2, applied, flip: flipNow }, wrong: wrong.slice(0, 3) };
  }
  // 6. the variable ended up on the right
  if (n === 2 && k === 1) return { next: { kind: 'swap', label: 'Swap the sides so ' + v + ' is on the left', result: [st.texts[1], st.texts[0]], rels: st.rels.map(r => FLIP[r]) }, wrong: [] };
  return { next: null, wrong: [] };
}
export function apply(st, move) {
  if (!move.result) return st;
  return make(st, move.result, move.rels, move.applied ? joinParts(move.applied, st.rels) : null);
}
// The whole correct solution, as text lines.
export function solution(text, opts) {
  let st = start(text, null, opts), lines = [stateText(st)], g = 0;
  for (;;) { const m = moves(st).next; if (!m || g++ > 20) break; st = apply(st, m); lines.push(stateText(st)); }
  const f = finished(st);
  return { lines, state: st, set: f.vanished ? f.set : solve({ parts: st.parts, rels: st.rels }, st.v) };
}

// ---------------------------------------------------------------- marking typed answers
const renameTo = (raw, from, to) => String(raw).replace(new RegExp(from, 'gi'), to);
// spec = { answer: '3t = 42', also?: [forms], traps?: [{ eq, code, message }] }.
// Right: the same solution AND written the way the story builds it (same shape, either way round).
export function checkEquation(spec, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { correct: false, code: 'empty', message: 'Type an equation first.' };
  let R; try { R = parseRelation(text); } catch (e) { return { correct: false, code: 'unreadable', message: e.message }; }
  const A = parseRelation(spec.answer), av = varsOf(A)[0], sv = varsOf(R);
  if (R.rels.join() !== A.rels.join()) return { correct: false, code: 'unreadable', message: A.rels[0] === '=' ? 'This one is an equation: use an = sign.' : 'Use the inequality sign from the situation.' };
  if (sv.length !== 1) return { correct: false, code: 'unreadable', message: sv.length ? 'Use just one letter for the unknown.' : 'Use a letter for the unknown quantity.' };
  if (sv[0] !== av) { R = parseRelation(renameTo(text, sv[0], av)); }
  let mine, theirs; try { mine = solve(R, av); theirs = solve(A, av); } catch (e) { return { correct: false, code: 'unreadable', message: e.message }; }
  const shapeOk = [spec.answer, ...(spec.also || [])].some(f => { const F = parseRelation(f); return (sameShape(R.parts[0], F.parts[0]) && sameShape(R.parts[1], F.parts[1])) || (sameShape(R.parts[0], F.parts[1]) && sameShape(R.parts[1], F.parts[0])); });
  if (sameSet(mine, theirs)) return shapeOk ? { correct: true, code: 'correct' } : { correct: false, code: 'unreadable', message: 'That has the right solution, but write the equation the story describes, using its numbers, before you solve it.' };
  for (const t of spec.traps || []) { const T = parseRelation(t.eq); if ((sameShape(R.parts[0], T.parts[0]) && sameShape(R.parts[1], T.parts[1])) || sameSet(mine, solve(T, av))) return { correct: false, code: t.code || 'wrong', message: t.message || null }; }
  return { correct: false, code: 'wrong', message: null };
}
// spec = { answer: 'x ≤ 8', flip?: true (the problem divides by a negative) }. Must be solved: the letter alone on one side.
export function checkInequality(spec, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { correct: false, code: 'empty', message: 'Type an inequality first, like x ≤ 8.' };
  let R; try { R = parseRelation(text); } catch (e) { return { correct: false, code: 'unreadable', message: e.message }; }
  const A = parseRelation(spec.answer), av = varsOf(A)[0], sv = varsOf(R);
  if (sv.length !== 1) return { correct: false, code: 'unreadable', message: 'Use one letter for the unknown.' };
  if (sv[0] !== av) R = parseRelation(renameTo(text, sv[0], av));
  if (R.rels.includes('=')) return { correct: false, code: 'unreadable', message: 'This answer is an inequality: use <, >, ≤ or ≥.' };
  let mine, theirs; try { mine = solve(R, av); theirs = solve(A, av); } catch (e) { return { correct: false, code: 'unreadable', message: e.message }; }
  const solved = R.parts.every(p => termCount(p) === 1) && R.parts.filter(p => variables(p).length).every(p => { const l = linear(p, av); return l && l.a.eq(1) && l.b.zero; });
  if (sameSet(mine, theirs)) return solved ? { correct: true, code: 'correct' } : { correct: false, code: 'unreadable', message: 'That’s equivalent, but finish solving: get ' + av + ' by itself.' };
  if (theirs.kind === 'ray' && mine.kind === 'ray' && mine.at.eq(theirs.at)) {
    if (mine.dir !== theirs.dir) return { correct: false, code: spec.flip ? 'no-flip' : 'direction', message: spec.flip ? 'Careful! When you divide an inequality by a negative number, the direction of the inequality must reverse.' : 'Right boundary, wrong direction. Test a value: does it make the original true?' };
    return { correct: false, code: 'open-closed', message: 'Right boundary and direction. Check whether the boundary value itself is allowed: ≤ and ≥ include it, < and > don’t.' };
  }
  if (theirs.kind === 'interval' && mine.kind === 'interval' && mine.lo.eq(theirs.lo) && mine.hi.eq(theirs.hi)) return { correct: false, code: 'open-closed', message: 'Right endpoints. Check which endpoints are included.' };
  return { correct: false, code: 'wrong', message: null };
}

// lhs − rhs at given values (exact): 0 means the equation holds there.
export function relationAt(text, values, opts) {
  const R = parseRelation(text, opts);
  return evaluate(R.parts[0], values).sub(evaluate(R.parts[1], values));
}
export { S as showNumber };

// ---------------------------------------------------------------- lines in two variables
// A linear equation in x and y (any letters), checked for equivalence (the
// same line: L − R proportional) and, optionally, for the form asked for.
// spec = { answer: 'C - 3060 = 420(d - 3)', y: 'c', x: 'd', form?: 'slope-intercept' | 'point-slope' | 'standard',
//          point?: [x1, y1] (point-slope must use this point), traps?: [{ eq, code, message }] }
function linePoly(R) { return padd(toPoly(R.parts[0]), toPoly(R.parts[1]), -1); }
function padd(A, B, sign) { const out = new Map(A); for (const [k, c] of B) { const v = (out.get(k) || new Frac(0)).add(sign < 0 ? c.neg() : c); if (v.zero) out.delete(k); else out.set(k, v); } return out; }
function sameLine(A, B) {
  if (!A || !B || A.size !== B.size || !A.size) return false;
  let ratio = null;
  for (const [k, c] of A) { if (!B.has(k)) return false; const r = c.div(B.get(k)); if (ratio && !ratio.eq(r)) return false; ratio = r; }
  return true;
}
// m and b of a line in x and y, or { vertical: x } / null
export function lineOf(text, x, y) {
  const P = linePoly(parseRelation(text)), a = P.get(x + ':1') || new Frac(0), c = P.get(y + ':1') || new Frac(0), k = P.get('') || new Frac(0);
  if (c.zero) return a.zero ? null : { vertical: k.neg().div(a) };
  return { m: a.neg().div(c), b: k.neg().div(c) };
}
const isAlone = (n, v) => n.t === 'var' && n.name === v;
export function checkLine(spec, raw) {
  const text = String(raw == null ? '' : raw).trim();
  if (!text) return { correct: false, code: 'empty', message: 'Type an equation first.' };
  let R; try { R = parseRelation(text); } catch (e) { return { correct: false, code: 'unreadable', message: e.message }; }
  if (R.parts.length !== 2 || R.rels[0] !== '=') return { correct: false, code: 'unreadable', message: 'Write one equation with an = sign.' };
  const x = spec.x, y = spec.y, used = varsOf(R), extra = used.filter(v => v !== x && v !== y);
  if (extra.length) return { correct: false, code: 'unreadable', message: `Use the letters ${y.toUpperCase()} and ${x}: ${extra.join(', ')} isn’t one of them.` };
  const mine = linePoly(R); if (!mine || [...mine.keys()].some(k => k && k !== x + ':1' && k !== y + ':1')) return { correct: false, code: 'unreadable', message: 'That isn’t a straight-line equation.' };
  const A = parseRelation(spec.answer), theirs = linePoly(A);
  if (sameLine(mine, theirs)) {
    const [L, Rt] = R.parts, side = isAlone(L, y) ? Rt : isAlone(Rt, y) ? L : null;
    if (spec.form === 'slope-intercept' && !(side && !variables(side).includes(y))) return { correct: false, code: 'unreadable', message: `That’s the right line, but write it in slope-intercept form: ${y.toUpperCase()} = m${x} + b.` };
    if (spec.form === 'point-slope') {
      const ok = [[L, Rt], [Rt, L]].some(([a, b]) => { const pa = toPoly(a), pb = toPoly(b); if (!pa || !pb) return false;
        const yOk = pa.size <= 2 && (pa.get(y + ':1') || new Frac(0)).eq(1) && [...pa.keys()].every(k => k === '' || k === y + ':1');
        const grouped = b.t === 'bin' && b.op === '*' && (b.a.t === 'group' || b.b.t === 'group');
        if (!yOk || !grouped) return false;
        if (spec.point) { const y1 = (pa.get('') || new Frac(0)).neg(), g = b.a.t === 'group' ? b.a.a : b.b.a, pg = toPoly(g), x1 = (pg.get('') || new Frac(0)).neg(); return y1.eq(spec.point[1]) && x1.eq(spec.point[0]); }
        return true; });
      if (!ok) return { correct: false, code: 'unreadable', message: spec.point ? `That’s the right line, but write it in point-slope form using the point (${spec.point[0]}, ${spec.point[1]}): ${y.toUpperCase()} − ${spec.point[1]} = m(${x} − ${spec.point[0]}).` : 'That’s the right line, but write it in point-slope form: y − y₁ = m(x − x₁).' };
    }
    return { correct: true, code: 'correct' };
  }
  for (const t of spec.traps || []) { try { if (sameLine(mine, linePoly(parseRelation(t.eq)))) return { correct: false, code: t.code || 'wrong', message: t.message || null }; } catch (e) { /* skip */ } }
  // Diagnose: right slope, wrong intercept, or the reverse.
  try {
    const me = lineOf(text, x, y), them = lineOf(spec.answer, x, y);
    if (me && them && !me.vertical && !them.vertical) {
      if (me.m.eq(them.m)) return { correct: false, code: 'intercept', message: 'The slope is right, but the line is in the wrong place: check the intercept (the value when ' + x + ' = 0).' };
      if (me.b.eq(them.b)) return { correct: false, code: 'slope', message: 'The intercept is right, but check the slope (the change in ' + y.toUpperCase() + ' for each 1 of ' + x + ').' };
      if (me.m.eq(them.m.neg())) return { correct: false, code: 'sign', message: 'Check the sign of the slope: does the line go up or down?' };
    }
  } catch (e) { /* ignore */ }
  return { correct: false, code: 'wrong', message: null };
}
