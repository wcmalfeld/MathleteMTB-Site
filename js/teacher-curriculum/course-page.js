// ============================================================
// Teacher Curriculum: a course page's quarter tabs.
//
// Without JavaScript all four quarters are listed one after another. With
// it they become tabs: the page opens on the quarter in the address
// (#q3, or a unit's #slug) or else the current quarter, and the address
// follows the tab so Back and shared links land in the same place.
// ============================================================
const tabs = [...document.querySelectorAll('[data-quarter-tab]')];
const panels = new Map([...document.querySelectorAll('[data-quarter-panel]')].map(p => [p.id, p]));

function quarterFor(hash) {
  const id = (hash || '').replace(/^#/, '');
  if (panels.has(id)) return { q: id };
  const unit = id && document.getElementById(id);
  const panel = unit && unit.closest('[data-quarter-panel]');
  return panel ? { q: panel.id, unit } : null;
}

function select(q, opts = {}) {
  tabs.forEach(t => {
    const on = t.getAttribute('data-quarter-tab') === q;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  });
  panels.forEach((p, id) => { p.hidden = id !== q; });
  if (opts.focus) tabs.find(t => t.getAttribute('data-quarter-tab') === q).focus();
  if (opts.push) history.replaceState(null, '', '#' + q);
}

if (tabs.length) {
  document.documentElement.classList.add('tc-tabs-on');
  const current = (tabs.find(t => t.hasAttribute('data-current')) || tabs[0]).getAttribute('data-quarter-tab');
  const start = quarterFor(location.hash);
  select(start ? start.q : current);
  if (start && start.unit) { start.unit.open = true; start.unit.scrollIntoView(); }

  tabs.forEach((t, i) => {
    t.addEventListener('click', e => { e.preventDefault(); select(t.getAttribute('data-quarter-tab'), { push: true }); });
    t.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }[e.key];
      if (d === undefined) return;
      e.preventDefault();
      const next = tabs[(i + d + tabs.length) % tabs.length];
      select(next.getAttribute('data-quarter-tab'), { focus: true, push: true });
    });
  });
  window.addEventListener('hashchange', () => {
    const hit = quarterFor(location.hash);
    if (!hit) return;
    select(hit.q);
    if (hit.unit) { hit.unit.open = true; hit.unit.scrollIntoView(); }
  });
}
