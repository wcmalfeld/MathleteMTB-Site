// Learning Lab dashboard: filter the tool cards by activity, math subject,
// level and length. Without JavaScript the filters stay hidden and every
// card shows. Filters are kept in the address (?subjects=physics) so a
// filtered view can be linked to.
(function () {
  'use strict';

  var form = document.querySelector('[data-lab-filters]');
  if (!form) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-lab-tool]'));
  var count = document.querySelector('[data-lab-count]');
  var empty = document.querySelector('[data-lab-empty]');
  var clear = document.querySelector('[data-lab-clear]');
  var selects = Array.prototype.slice.call(form.querySelectorAll('select'));

  function matches(card, name, value) {
    if (!value) return true;
    return (card.getAttribute('data-' + name) || '').split(' ').indexOf(value) !== -1;
  }

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var ok = selects.every(function (s) { return matches(card, s.name, s.value); });
      card.hidden = !ok;
      if (ok) shown++;
    });
    var filtered = selects.some(function (s) { return s.value; });
    count.hidden = !filtered;
    count.textContent = 'Showing ' + shown + ' of ' + cards.length + ' tools';
    empty.hidden = shown > 0;
    syncAddress();
  }

  function syncAddress() {
    var params = new URLSearchParams();
    selects.forEach(function (s) { if (s.value) params.set(s.name, s.value); });
    var q = params.toString();
    try { history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash); } catch (e) {}
  }

  // Start from the address, ignoring values that aren't options.
  var initial = new URLSearchParams(location.search);
  selects.forEach(function (s) {
    var v = initial.get(s.name);
    if (v && s.querySelector('option[value="' + CSS.escape(v) + '"]')) s.value = v;
  });

  form.addEventListener('change', apply);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  // "reset" fires before the selects change, so apply afterwards.
  form.addEventListener('reset', function () { setTimeout(apply, 0); });
  if (clear) clear.addEventListener('click', function () { form.reset(); });

  form.hidden = false;
  apply();
})();
