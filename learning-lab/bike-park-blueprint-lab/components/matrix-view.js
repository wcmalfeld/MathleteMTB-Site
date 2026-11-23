// Matrix display: a real table (so screen readers read rows and columns),
// with bracket styling, optional augmented bar, row and column labels,
// highlighted cells and optional click-to-select cells. Wide matrices
// scroll sideways inside their own box (never the page).

import { el } from '../../lesson-kit/dom.js';

// matrixView(rows, { name, aug: true|false, rowLabels, colLabels, hi: { 'r,c': cls }, rowHi: { r: cls }, onCell(r, c), caption })
export function matrixView(rows, o = {}) {
  const n = rows.length, m = n ? rows[0].length : 0;
  const cell = (v, r, c) => {
    const cls = ['bp-cell', o.aug && c === m - 1 ? 'is-const' : '', (o.hi && o.hi[r + ',' + c]) || '', (o.rowHi && o.rowHi[r]) || ''].filter(Boolean).join(' ');
    const text = String(v);
    if (o.onCell) return el('td', { class: cls }, el('button', { type: 'button', class: 'bp-cellbtn', onclick: () => o.onCell(r, c), 'aria-label': `${(o.rowLabels || [])[r] || 'Row ' + (r + 1)}, ${(o.colLabels || [])[c] || 'column ' + (c + 1)}: ${text}` }, text));
    return el('td', { class: cls }, text);
  };
  const table = el('table', { class: 'bp-matrix' + (o.aug ? ' bp-matrix--aug' : '') },
    el('caption', { class: o.showCaption ? 'bp-mcap' : 'ls-sr' }, o.caption || ((o.name ? o.name + ': ' : '') + `${n} × ${m} matrix`)),
    o.colLabels ? el('thead', null, el('tr', null, o.rowLabels ? el('th', { scope: 'col' }, el('span', { class: 'ls-sr' }, 'Row')) : null, o.colLabels.map(l => el('th', { scope: 'col', class: 'bp-collab' }, l)))) : null,
    el('tbody', null, rows.map((row, r) => el('tr', null, o.rowLabels ? el('th', { scope: 'row', class: 'bp-rowlab' }, o.rowLabels[r]) : null, row.map((v, c) => cell(v, r, c))))));
  return el('div', { class: 'bp-mwrap' }, o.name ? el('span', { class: 'bp-mname' }, o.name, el('span', { 'aria-hidden': 'true' }, ' =')) : null,
    el('div', { class: 'bp-mscroll' }, table), o.dims ? el('span', { class: 'bp-mdims' }, `${n} × ${m}`) : null);
}
