// Bike Park Blueprint Lab: exact arithmetic. Matrices of fractions (the
// fractions are the lesson kit's Frac, lesson-kit/frac.js), so elimination
// and inverses never pick up floating-point noise (−3/4 stays −3/4, not
// −0.7500000001). Pure; no DOM.

import { Frac } from '../../lesson-kit/frac.js';
export { Frac };

const F = x => Frac.of(x);

// ---------- matrices (arrays of rows of Fracs) ----------
export const mat = rows => rows.map(r => r.map(F));
export const dims = A => [A.length, A.length ? A[0].length : 0];
export const dimText = A => dims(A).join(' × ');
export const toNumbers = A => A.map(r => r.map(Number));
export const sameShape = (A, B) => dims(A)[0] === dims(B)[0] && dims(A)[1] === dims(B)[1];
export function add(A, B) { if (!sameShape(A, B)) throw new RangeError(`can’t add a ${dimText(A)} and a ${dimText(B)} matrix`); return A.map((r, i) => r.map((v, j) => v.add(B[i][j]))); }
export function sub(A, B) { if (!sameShape(A, B)) throw new RangeError(`can’t subtract a ${dimText(B)} from a ${dimText(A)} matrix`); return A.map((r, i) => r.map((v, j) => v.sub(B[i][j]))); }
export const scale = (k, A) => A.map(r => r.map(v => v.mul(k)));
export const canMultiply = (A, B) => dims(A)[1] === dims(B)[0];
// Row-by-column multiplication (never entry-by-entry).
export function mul(A, B) {
  if (!canMultiply(A, B)) throw new RangeError(`can’t multiply a ${dimText(A)} by a ${dimText(B)}: ${dims(A)[1]} columns ≠ ${dims(B)[0]} rows`);
  return A.map(row => B[0].map((_, j) => row.reduce((s, v, k) => s.add(v.mul(B[k][j])), F(0))));
}
// The products that make up one entry of AB: row i of A against column j of B.
export const dotTerms = (A, B, i, j) => A[i].map((v, k) => [v, B[k][j]]);
export const transpose = A => A[0].map((_, j) => A.map(r => r[j]));
export const identity = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => F(i === j ? 1 : 0)));
export const equal = (A, B) => sameShape(A, B) && A.every((r, i) => r.every((v, j) => v.eq(B[i][j])));

export function det(A) {
  const [n, m] = dims(A);
  if (n !== m) throw new RangeError('only square matrices have determinants');
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0].mul(A[1][1]).sub(A[0][1].mul(A[1][0]));
  return A[0].reduce((s, v, j) => {
    const minor = A.slice(1).map(r => r.filter((_, k) => k !== j));
    const term = v.mul(det(minor));
    return j % 2 ? s.sub(term) : s.add(term);
  }, F(0));
}
// Inverse by Gauss–Jordan on [A | I]; null when det(A) = 0 (checked first).
export function inverse(A) {
  const n = A.length;
  if (det(A).zero) return null;
  const M = A.map((r, i) => [...r, ...identity(n)[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; while (M[p][c].zero) p++;
    [M[c], M[p]] = [M[p], M[c]];
    const pv = M[c][c]; M[c] = M[c].map(v => v.div(pv));
    for (let r = 0; r < n; r++) if (r !== c && !M[r][c].zero) { const k = M[r][c]; M[r] = M[r].map((v, j) => v.sub(k.mul(M[c][j]))); }
  }
  const inv = M.map(r => r.slice(n));
  if (!equal(mul(A, inv), identity(n))) throw new Error('inverse failed its check');   // verified before use
  return inv;
}

// ---------- augmented matrices and row operations ----------
// op: { type: 'swap', i, j } | { type: 'scale', i, k } (k ≠ 0) | { type: 'add', i, j, k }  (Rᵢ → Rᵢ + k·Rⱼ, i ≠ j)
export function rowOp(M, op) {
  const R = M.map(r => r.slice()), n = R.length;
  const okRow = r => Number.isInteger(r) && r >= 0 && r < n;
  if (!okRow(op.i) || (op.type !== 'scale' && !okRow(op.j))) throw new RangeError('pick rows that exist');
  if (op.type === 'swap') { if (op.i === op.j) throw new RangeError('pick two different rows'); [R[op.i], R[op.j]] = [R[op.j], R[op.i]]; return R; }
  const k = F(op.k);
  if (op.type === 'scale') { if (k.zero) throw new RangeError('multiplying a row by 0 loses its equation'); R[op.i] = R[op.i].map(v => v.mul(k)); return R; }
  if (op.type === 'add') { if (op.i === op.j) throw new RangeError('add a multiple of a different row'); R[op.i] = R[op.i].map((v, c) => v.add(k.mul(R[op.j][c]))); return R; }
  throw new RangeError('unknown row operation');
}
export function describeOp(op) {
  const r = i => 'R' + (i + 1), k = F(op.k ?? 1);
  if (op.type === 'swap') return `${r(op.i)} ↔ ${r(op.j)}`;
  if (op.type === 'scale') return `${r(op.i)} → ${k}·${r(op.i)}`;
  const mag = k.n < 0 ? k.neg() : k;
  return `${r(op.i)} → ${r(op.i)} ${k.n < 0 ? '−' : '+'} ${mag.eq(1) ? '' : mag + '·'}${r(op.j)}`;
}
// Does x satisfy every row of the augmented matrix?
export const satisfies = (M, x) => M.every(r => r.slice(0, -1).reduce((s, v, j) => s.add(v.mul(x[j])), F(0)).eq(r[r.length - 1]));

// Read the state of an augmented matrix after (any) row operations.
//  - 'contradiction': a row 0 0 … 0 | c with c ≠ 0 → no solution
//  - 'solved': upper triangular with nonzero diagonal → back-substitute
//  - 'redundant': a row of all zeros and no contradiction (fewer independent rows)
//  - 'working': none of these yet
export function analyse(M) {
  const n = M[0].length - 1;
  const zeroCoef = r => r.slice(0, n).every(v => v.zero);
  const contradiction = M.findIndex(r => zeroCoef(r) && !r[n].zero);
  if (contradiction >= 0) return { state: 'contradiction', row: contradiction };
  const zeroRow = M.findIndex(r => zeroCoef(r) && r[n].zero);
  const upper = M.length === n && M.every((r, i) => r.slice(0, i).every(v => v.zero) && !r[i].zero);
  if (upper) {
    const x = Array(n).fill(F(0));
    for (let i = n - 1; i >= 0; i--) x[i] = M[i][n].sub(M[i].slice(i + 1, n).reduce((s, v, j) => s.add(v.mul(x[i + 1 + j])), F(0))).div(M[i][i]);
    return { state: 'solved', solution: x };
  }
  if (zeroRow >= 0) return { state: 'redundant', row: zeroRow };
  return { state: 'working' };
}
// Classify a square system exactly: by elimination on [A | b].
export function classify(A, b) {
  const n = A.length;
  let M = A.map((r, i) => [...r.map(F), F(b[i])]);
  let row = 0;
  for (let c = 0; c < n && row < n; c++) {
    let p = row; while (p < n && M[p][c].zero) p++;
    if (p === n) continue;
    [M[row], M[p]] = [M[p], M[row]];
    for (let r = row + 1; r < n; r++) if (!M[r][c].zero) { const k = M[r][c].div(M[row][c]); M[r] = M[r].map((v, j) => v.sub(k.mul(M[row][j]))); }
    row++;
  }
  const a = analyse(M);
  if (a.state === 'contradiction') return { type: 'none', echelon: M };
  if (row < n) return { type: 'infinite', echelon: M };
  const x = inverse(A.map(r => r.map(F)));
  return { type: 'one', echelon: M, solution: mul(x, b.map(v => [F(v)])).map(r => r[0]) };
}
