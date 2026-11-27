// The Dream Line Project: number sets and the properties of real numbers.
// Pure; no DOM. This lab uses the convention that the natural numbers start
// at 1 (so 0 is whole but not natural).
//
// A number card is { label, value: Frac } for a rational number, or
// { label, irrational: true } for π and square roots of non-squares.
// sqrtCard(n) builds √n and works out which kind it is (√9 = 3 is natural).

import { Frac } from '../../lesson-kit/frac.js';

export const SETS = ['natural', 'whole', 'integer', 'rational', 'irrational'];
export const SET_NAMES = { natural: 'Natural', whole: 'Whole', integer: 'Integer', rational: 'Rational', irrational: 'Irrational', real: 'Real' };
export const NATURAL_NOTE = 'This lab uses the convention that the natural numbers start at 1: 1, 2, 3, … (some books include 0).';

export function classify(card) {
  if (card.irrational) return { natural: false, whole: false, integer: false, rational: false, irrational: true, real: true };
  const v = Frac.of(card.value), int = v.int;
  return { natural: int && v.n >= 1, whole: int && v.n >= 0, integer: int, rational: true, irrational: false, real: true };
}
export const setsOf = card => SETS.filter(s => classify(card)[s]);
// The smallest set in the chain the number belongs to (where its dot goes in the diagram).
export const innermost = card => (card.irrational ? 'irrational' : ['natural', 'whole', 'integer', 'rational'].find(s => classify(card)[s]));

export function sqrtCard(n, context) {
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? { label: '√' + n, value: new Frac(r), context, note: '√' + n + ' = ' + r } : { label: '√' + n, irrational: true, context, note: n + ' isn’t a perfect square, so √' + n + ' never ends or repeats' };
}

// Why a card belongs (or doesn't) to each set, in words.
export function reasons(card) {
  const c = classify(card), out = [];
  if (card.irrational) {
    out.push(card.label + ' is irrational: its decimal never ends and never repeats, so it can’t be written as a fraction of two integers.');
    out.push('It’s still a real number: it has a place on the number line.');
    return out;
  }
  const v = Frac.of(card.value);
  if (c.natural) out.push('Natural: a counting number (1, 2, 3, …).');
  else if (c.whole) out.push('Whole but not natural: 0 is a whole number, but counting starts at 1.');
  else if (c.integer) out.push('Integer but not whole: negative whole numbers are integers.');
  if (c.integer) out.push('Rational: any integer can be written as a fraction, ' + v.n + ' = ' + v.n + '/1.');
  else out.push('Rational but not an integer: it can be written as a fraction of integers, ' + (card.label.includes('/') ? card.label : card.label + ' = ' + v.n + '/' + v.d) + '.');
  return out;
}

// The seven cards from the PRD, with their park meanings.
export const CARDS = [
  { id: 'six', label: '6', value: new Frac(6), context: 'Six jump features' },
  { id: 'zero', label: '0', value: new Frac(0), context: 'Zero extra materials needed' },
  { id: 'neg4', label: '−4', value: new Frac(-4), context: 'Four feet of signed elevation change (a drop of 4 ft)' },
  { id: 'twohalf', label: '2.5', value: new Frac(5, 2), context: 'A mapped trail measurement' },
  { id: 'threequarters', label: '3/4', value: new Frac(3, 4), context: 'A fraction of the park completed' },
  { id: 'pi', label: 'π', irrational: true, context: 'The wheel circumference constant' },
  { id: 'root2', label: '√2', irrational: true, context: 'The diagonal of a unit square on a park map' }
];

// ---------------------------------------------------------------- properties
// Each check is computed, so a non-example is shown to fail, not just said to.
export const PROPERTIES = {
  commutative: { name: 'Commutative', say: 'Change the order of numbers you add or multiply; the result stays the same.' },
  associative: { name: 'Associative', say: 'Change how numbers you add or multiply are grouped; the result stays the same.' },
  identity: { name: 'Identity', say: 'Adding 0 or multiplying by 1 leaves a number unchanged.' },
  inverse: { name: 'Inverse', say: 'A number plus its opposite is 0; a nonzero number times its reciprocal is 1.' },
  distributive: { name: 'Distributive', say: 'Multiplying a sum multiplies each part: a(b + c) = ab + ac.' }
};
const F = x => Frac.of(x);
const op = (o, a, b) => (o === '+' ? F(a).add(b) : o === '−' ? F(a).sub(b) : o === '×' ? F(a).mul(b) : F(a).div(b));
// Does a op b = b op a?  Does (a op b) op c = a op (b op c)?
export const commutes = (o, a, b) => op(o, a, b).eq(op(o, b, a));
export const associates = (o, a, b, c) => op(o, op(o, a, b), c).eq(op(o, a, op(o, b, c)));
export const distributes = (a, b, c) => F(a).mul(F(b).add(c)).eq(F(a).mul(b).add(F(a).mul(c)));
export const additiveInverse = a => F(a).neg();
export function reciprocal(a) { const v = F(a); if (v.zero) return null; return new Frac(1).div(v); }
export const ops = { op };
