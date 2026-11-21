// Contextual help (PRD 9): a small "?" button next to a control or result
// opens its explanation (plain definition, equation, picture, skiing
// connection, and a deeper dive) in a dialog.

import { el, button, put } from './dom.js';
import { HELP } from '../logic/explain.js';
import { helpVisual } from './visuals.js';

let dialog = null, body = null, opener = null;

function ensure(host) {
  if (dialog && dialog.isConnected) return;
  body = el('div', { class: 'bl-help-body' });
  dialog = el('dialog', { class: 'bl-help', 'aria-labelledby': 'bl-help-title' },
    el('div', { class: 'bl-help-inner' }, button('Close', () => close(), 'bl-btn--ghost bl-help-close', { 'aria-label': 'Close explanation' }), body));
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  dialog.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus(); });
  (host.closest('.blab') || host).appendChild(dialog);
}
function close() { if (!dialog) return; if (typeof dialog.close === 'function' && dialog.open) dialog.close(); else { dialog.removeAttribute('open'); if (opener) opener.focus(); } }

// The explanation's content, also used inline on "The model" page.
export function helpContent(key, headingTag) {
  const h = HELP[key];
  if (!h) return null;
  return el('div', { class: 'bl-explain' },
    el(headingTag || 'h2', { class: 'bl-explain-title', id: headingTag ? null : 'bl-help-title' }, h.title),
    el('p', null, h.plain),
    el('p', { class: 'bl-explain-eq' }, h.equation),
    el('div', { class: 'bl-explain-visual' }, helpVisual(h.visual)),
    el('p', null, el('b', null, 'On the slopes: '), h.ski),
    el('details', { class: 'bl-explain-deeper' }, el('summary', null, 'Go deeper'), el('p', null, h.deeper)));
}

export function openHelp(key, from) {
  ensure(from);
  opener = from;
  put(body, helpContent(key));
  if (typeof dialog.showModal === 'function') { if (!dialog.open) dialog.showModal(); } else dialog.setAttribute('open', '');
  const t = dialog.querySelector('.bl-help-close'); if (t) t.focus();
}

export function helpButton(key, label) {
  const b = el('button', { type: 'button', class: 'bl-help-btn', 'aria-label': 'Explain: ' + (label || (HELP[key] || {}).title || key), 'aria-haspopup': 'dialog' }, '?');
  b.addEventListener('click', () => openHelp(key, b));
  return b;
}
