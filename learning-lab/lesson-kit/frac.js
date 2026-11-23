// Lesson kit: exact fractions. Whole-number numerator and denominator,
// always reduced, denominator positive, so lab maths never picks up
// floating-point noise (−3/4 stays −3/4, 0.1 + 0.2 is exactly 3/10).
// Used by the Bike Park Blueprint Lab (matrices) and the Trail Dynamics
// Lab (quadratics). Pure; no DOM.

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };

class Frac {
  constructor(n, d = 1) {
    if (!Number.isInteger(n) || !Number.isInteger(d)) throw new TypeError('Frac needs whole numbers');
    if (d === 0) throw new RangeError('division by zero');
    const g = gcd(n, d), s = d < 0 ? -1 : 1;
    this.n = (s * n) / g; this.d = (s * d) / g;
    if (Object.is(this.n, -0)) this.n = 0;
  }
  static of(x) {
    if (x instanceof Frac) return x;
    if (Number.isInteger(x)) return new Frac(x, 1);
    if (typeof x === 'number' && isFinite(x)) {           // short decimals: 0.25, 2.3
      const p = 10 ** Math.min(9, (String(x).split('.')[1] || '').length);
      return new Frac(Math.round(x * p), p);
    }
    throw new TypeError('not a number: ' + x);
  }
  // "3", "-3/4", "−0.5", "1 / 2" → Frac, or null if it can't be read.
  static parse(raw) {
    const t = String(raw == null ? '' : raw).trim().replace(/[−–—]/g, '-').replace(/\s+/g, '');
    if (!t) return null;
    let m = t.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    if (m) return Number(m[2]) === 0 ? null : new Frac(Number(m[1]), Number(m[2]));
    m = t.match(/^[+-]?(\d+\.?\d*|\.\d+)$/);
    return m ? Frac.of(Number(t)) : null;
  }
  add(o) { o = Frac.of(o); return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Frac.of(o); return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Frac.of(o); return new Frac(this.n * o.n, this.d * o.d); }
  div(o) { o = Frac.of(o); if (o.n === 0) throw new RangeError('division by zero'); return new Frac(this.n * o.d, this.d * o.n); }
  neg() { return new Frac(-this.n, this.d); }
  eq(o) { o = Frac.of(o); return this.n === o.n && this.d === o.d; }
  get zero() { return this.n === 0; }
  get int() { return this.d === 1; }
  valueOf() { return this.n / this.d; }
  toString() { return (this.n < 0 ? '−' : '') + Math.abs(this.n) + (this.d === 1 ? '' : '/' + this.d); }
}
export { Frac };
export const gcdInt = gcd;
