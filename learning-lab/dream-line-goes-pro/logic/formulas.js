// The Dream Line Goes Pro: the Formula Garage. Three formulas, every
// rearrangement, the operations that get there (and the tempting wrong ones),
// and units. Each rearranged form is tested for equivalence with the
// original by substituting exact values (scripts/test-dream-line-goes-pro.mjs),
// never by matching one numeric answer.

export const FORMULAS = {
  speed: {
    id: 'speed', name: 'Speed, distance and time', base: 'd = rt',
    vars: { d: { name: 'distance', unit: 'km' }, r: { name: 'average speed', unit: 'km/h' }, t: { name: 'time', unit: 'h' } },
    forms: { d: 'd = rt', r: 'r = d/t', t: 't = d/r' },
    steps: {
      t: [{ op: 'Divide both sides by r', result: 'd/r = t', wrong: [['Multiply both sides by r', 'That gives dr = r²t: another r, not fewer. r multiplies t, so divide to undo it.'], ['Subtract r from both sides', 'r multiplies t (rt means r × t), so undo it with division, not subtraction.']] }],
      r: [{ op: 'Divide both sides by t', result: 'd/t = r', wrong: [['Divide both sides by r', 'That isolates t, not r. To get r alone, undo the multiplication by t.'], ['Subtract t from both sides', 't multiplies r, so undo it with division.']] }]
    }
  },
  grade: {
    id: 'grade', name: 'Trail grade', base: 'G = 100R/L',
    vars: { G: { name: 'percentage grade', unit: '%' }, R: { name: 'vertical rise', unit: 'ft' }, L: { name: 'horizontal run', unit: 'ft' } },
    forms: { G: 'G = 100R/L', R: 'R = GL/100', L: 'L = 100R/G' },
    steps: {
      R: [{ op: 'Multiply both sides by L', result: 'GL = 100R', wrong: [['Divide both sides by L', 'R is already divided by L. Multiplying by L undoes that division.'], ['Subtract L from both sides', 'L divides 100R, so undo it with multiplication.']] },
        { op: 'Divide both sides by 100', result: 'GL/100 = R', wrong: [['Subtract 100 from both sides', '100R means 100 × R: undo multiplication with division.'], ['Divide the right side only by 100', 'Do the same thing to both sides, or they stop being equal.']] }],
      L: [{ op: 'Multiply both sides by L', result: 'GL = 100R', wrong: [['Divide both sides by G', 'L is in the denominator. Multiply by L first to bring it out.'], ['Subtract 100R from both sides', 'That doesn’t move L out of the denominator.']] },
        { op: 'Divide both sides by G', result: 'L = 100R/G', wrong: [['Divide both sides by 100R', 'L is multiplied by G, so divide by G to get L alone.'], ['Multiply both sides by G', 'G multiplies L, so divide to undo it.']] }]
    }
  },
  sag: {
    id: 'sag', name: 'Suspension sag', base: 'P = 100S/T',
    vars: { P: { name: 'sag percentage', unit: '%' }, S: { name: 'measured compression', unit: 'mm' }, T: { name: 'total shock stroke', unit: 'mm' } },
    forms: { P: 'P = 100S/T', S: 'S = PT/100', T: 'T = 100S/P' },
    steps: {
      S: [{ op: 'Multiply both sides by T', result: 'PT = 100S', wrong: [['Divide both sides by T', 'S is already divided by T. Multiply by T to undo the division.'], ['Subtract T from both sides', 'T divides 100S, so undo it with multiplication.']] },
        { op: 'Divide both sides by 100', result: 'PT/100 = S', wrong: [['Subtract 100 from both sides', '100S means 100 × S: divide to undo it.'], ['Divide the left side only by 100', 'Do the same thing to both sides.']] }],
      T: [{ op: 'Multiply both sides by T', result: 'PT = 100S', wrong: [['Divide both sides by P', 'T is in the denominator. Multiply by T first.'], ['Add T to both sides', 'T divides 100S, so undo it by multiplying.']] },
        { op: 'Divide both sides by P', result: 'T = 100S/P', wrong: [['Multiply both sides by P', 'P multiplies T, so divide to undo it.'], ['Divide both sides by 100S', 'Divide by what multiplies T: that’s P.']] }]
    }
  }
};
// The letter that starts isolated in each formula.
export const ISOLATED = { speed: 'd', grade: 'G', sag: 'P' };
// Values to check rearrangements with (any nonzero values work; these are tidy).
export const SAMPLE = { speed: { r: 16, t: 0.3 }, grade: { R: 18, L: 300 }, sag: { S: 15, T: 50 } };
