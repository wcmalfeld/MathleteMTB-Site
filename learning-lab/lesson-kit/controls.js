// Lesson kit: small controls for lab interactives. Sliders are native range
// inputs (keyboard and screen readers work) with a live readout and an
// aria-valuetext; segmented controls are radio groups; status chips pair a
// symbol with words so colour is never the only signal.

import { el, put, id as uid } from './dom.js';

const nf = x => String(Number(Number(x).toPrecision(12)));

// slider({ label, min, max, step, value, unit, onInput(v), describe(v) }) -> { node, input, set(v) }
export function slider({ label, min, max, step, value, unit, onInput, describe, format }) {
  const sid = uid('s');
  const show = v => (format ? format(v) : nf(v)) + (unit ? ' ' + unit : '');
  const out = el('output', { class: 'ls-out', for: sid });
  const input = el('input', { type: 'range', id: sid, class: 'ls-range', min, max, step, value });
  const sync = () => { out.textContent = show(+input.value); input.setAttribute('aria-valuetext', describe ? describe(+input.value) : out.textContent); };
  input.addEventListener('input', () => { sync(); onInput(+input.value); });
  sync();
  return { node: el('div', { class: 'ls-control' }, el('div', { class: 'ls-control-top' }, el('label', { for: sid }, label), out), input,
    el('div', { class: 'ls-range-ends', 'aria-hidden': 'true' }, el('span', null, show(min)), el('span', null, show(max)))), input, set(v) { input.value = v; sync(); } };
}

// segs(label, [{ label, value }], current, onPick(value)) -> element
export function segs(label, items, value, onPick) {
  const box = el('div', { class: 'ls-segs', role: 'radiogroup', 'aria-label': label });
  const draw = cur => put(box, items.map(it => el('button', { type: 'button', role: 'radio', class: 'ls-seg', 'aria-checked': String(it.value === cur), onclick: () => { draw(it.value); onPick(it.value); } }, it.label)));
  draw(value);
  return box;
}

export const status = (ok, yes, no) => el('span', { class: 'ms-status ' + (ok ? 'ms-status--ok' : 'ms-status--warn') }, el('span', { 'aria-hidden': 'true' }, ok ? '✓ ' : '! '), ok ? yes : no);
