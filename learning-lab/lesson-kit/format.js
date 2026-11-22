// Display rounding for lessons. Numbers are never rounded in the maths, only
// in the words on screen. toPrecision(12) first removes float noise
// (0.1 + 0.2 shows as 0.3).
const finite = x => typeof x === 'number' && isFinite(x);
export function fmt(x, digits = 1) {
  if (x === null || x === undefined || !finite(x)) return '—';
  const s = Number(x.toPrecision(12)).toFixed(digits);
  return (s === '-0' || /^-0\.0*$/.test(s)) ? s.slice(1) : s;
}
