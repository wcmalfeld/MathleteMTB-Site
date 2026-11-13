// Small DOM helpers shared by the lab's screens. All text is set as text,
// never parsed as HTML.

const SVGNS = 'http://www.w3.org/2000/svg';

function set(node, attrs) {
  if (!attrs) return;
  for (const k of Object.keys(attrs)) {
    const v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.setAttribute('class', v);
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
}
function add(node, child) {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) { child.forEach(c => add(node, c)); return; }
  node.appendChild(typeof child === 'object' ? child : document.createTextNode(String(child)));
}

// el('p', { class: 'x' }, 'text', child, [more])
export function el(tag, attrs, ...kids) { const n = document.createElement(tag); set(n, attrs); kids.forEach(k => add(n, k)); return n; }
export function svg(tag, attrs, ...kids) { const n = document.createElementNS(SVGNS, tag); set(n, attrs); kids.forEach(k => add(n, k)); return n; }
export function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

// A stacked fraction:  top
//                      ───
//                      bottom   (read as "top over bottom" by screen readers)
export function frac(top, bottom, label) {
  return el('span', { class: 'sl-frac', role: 'math', 'aria-label': label || `${textOf(top)} over ${textOf(bottom)}` },
    el('span', { class: 'sl-frac-top', 'aria-hidden': 'true' }, top),
    el('span', { class: 'sl-frac-bar', 'aria-hidden': 'true' }),
    el('span', { class: 'sl-frac-bottom', 'aria-hidden': 'true' }, bottom));
}
function textOf(x) { return x && typeof x === 'object' ? x.textContent : String(x); }

// An italic math variable.
export const v = name => el('var', null, name);

// A displayed equation line: eq('m', ' = ', frac(...), ' = 0.2')
export function eq(...parts) { return el('p', { class: 'sl-eq' }, parts); }

// A button that reads as a button.
export function button(label, onclick, cls) { return el('button', { type: 'button', class: 'sl-btn' + (cls ? ' ' + cls : ''), onclick }, label); }

// A unique id for label/input pairs.
let uid = 0;
export const id = prefix => (prefix || 'sl') + '-' + (++uid);

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
