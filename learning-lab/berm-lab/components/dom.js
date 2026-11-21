// Small DOM helpers (the same ones the other labs use, prefixed bl-). All
// text is set as text, never parsed as HTML.

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
// Replace a node's children (skipping null/undefined).
export function put(n, ...kids) { clear(n); kids.forEach(k => add(n, k)); return n; }
export function attrs(n, a) { set(n, a); return n; }

export function button(label, onclick, cls, extra) { return el('button', { type: 'button', class: 'bl-btn' + (cls ? ' ' + cls : ''), onclick, ...(extra || {}) }, label); }

let uid = 0;
export const id = prefix => (prefix || 'cl') + '-' + (++uid);

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// An italic maths variable, with an optional subscript: v('R', 'sc')
export const v = (name, sub) => el('var', null, name, sub ? el('sub', null, sub) : null);
